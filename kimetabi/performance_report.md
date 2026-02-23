# Next.js アプリケーション パフォーマンス調査レポート

## 1. はじめに

このレポートは、Next.jsアプリケーションで報告された「動作がモッサりする」というパフォーマンス問題に関する調査結果と、その改善策をまとめたものです。調査の結果、データ取得処理のアーキテクチャに複数の根深い問題が特定されました。

## 2. 調査結果の要約

パフォーマンス低下の主な原因は、**深刻なデータ取得のウォーターフォール（滝のように連鎖的で非効率な処理）**にあります。具体的には、以下の3つの問題が複合的に発生しています。

1.  **過剰で冗長なデータ取得:** 本来は1回で済むはずのユーザー認証情報の取得が、1ページを表示する間に**最低4回**も繰り返し実行されています。
2.  **レンダリングを阻害する直列な処理:** 複数の独立したデータベース問い合わせが直列で実行されており、すべての処理が完了するまでページの描画が開始されません。
3.  **キャッシュの完全な無効化:** ルートレイアウトで動的な関数（`auth()`）が呼び出されるため、アプリケーション全体のページがキャッシュされず、毎回サーバーサイドでレンダリングされています。

## 3. 問題点の詳細

### 3.1. 深刻なデータ取得ウォーターフォールと冗長な処理

現在の実装では、各コンポーネントが必要なデータをそれぞれ個別に取得しにいく設計になっています。これにより、非効率な処理の連鎖（ウォーターフォール）が発生しています。

#### a. 全てのページの動的レンダリング化

まず、認証が必要なページ全体を囲むレイアウトファイルで `auth()` が呼び出されています。

**`app/(auth)/layout.tsx`**
```tsx
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // --- 1回目のauth()呼び出し ---
  const session = await auth() 
  if (!session) {
    return redirect('/login')
  }
  // ...
}
```
`auth()` は動的な関数であるため、このレイアウトが適用されるすべてのページは静的に生成（SSG）またはキャッシュされることなく、リクエストごとにサーバーでレンダリングされるようになります。

#### b. 各コンポーネントでの個別データ取得

次に、メインページが2つの主要なコンポーネントを呼び出していますが、この時点ではデータを渡していません。

**`app/(auth)/page.tsx`**
```tsx
export default async function Home() {
  // --- 2回目のauth()呼び出し ---
  const session = await auth()

  if (!session) return (
    redirect('/login')
  )
  return (
    <div>
      {/* ... */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <HostedProjects />
        </div>
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <MyProjectsList />
        </div>
      </div>
    </div>
  );
}
```

そして、呼び出された各コンポーネントが、それぞれで `auth()` とデータベース問い合わせを再度実行しています。

**`components/main/HostedProjects.tsx`**
```tsx
export default async function HostedProjects() {
  // --- 3回目のauth()呼び出し ---
  const session = await auth()
  const userId = session?.user?.id
  
  // --- データベース問い合わせ ---
  const hostedProjects = await prisma.project.findMany({
    // ...
  })
  // ...
}
```

**`components/project/MyProjectsList.tsx`**
```tsx
export default async function MyProjectsList() {
  // --- 4回目のauth()呼び出し ---
  const session = await auth()
  const userId = session?.user?.id

  // --- データベース問い合わせ ---
  const memberships = await prisma.projectMember.findMany({
    // ...
  })
  // ...
}
```

この結果、1つのページを表示するために、同じ `auth()` の処理が4回、データベースへの問い合わせが2回、**直列で**実行されるという非常に非効率な状態に陥っています。

### 3.2. レンダリングをブロックするデータベースクエリ

`app/(auth)/page.tsx`では、`HostedProjects`と`MyProjectsList`が`<Suspense>`でラップされていません。

Reactのサーバーコンポーネントの仕様上、これは`HostedProjects`と`MyProjectsList`の内部で行われる**両方の**データベース問い合わせが完了するまで、ページ全体のHTML生成が開始されないことを意味します。ユーザーは、すべてのデータが揃うまで真っ白な画面を見続けることになります。

## 4. 推奨される改善策

根本的な解決策は、**「データ取得をページのトップレベルで一括して行い、結果を子コンポーネントにPropsとして渡す」**というReactの基本設計に沿った形にリファクタリングすることです。

### 4.1. データ取得ロジックの集約と並列化

`app/(auth)/page.tsx`で、配下のコンポーネントが必要とするすべてのデータを`Promise.all`を使って一括かつ並列で取得します。

**修正後の `app/(auth)/page.tsx`**
```tsx
import { auth } from "@/auth"
import HostedProjects from "@/components/main/HostedProjects";
import MyProjectsList from "@/components/project/MyProjectList";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth()

  if (!session?.user?.id) {
    return redirect('/login')
  }

  const userId = session.user.id;

  // Promise.allで2つのDB問い合わせを並列実行
  const [hostedProjects, memberships] = await Promise.all([
    // HostedProjects のためのデータ取得
    prisma.project.findMany({
      where: { members: { some: { userId: userId, role: "MASTER" }}},
      include: { members: { include: { user: true }, orderBy: { status: 'desc' }}},
      orderBy: { departureDate: "asc" },
    }),
    // MyProjectsList のためのデータ取得
    prisma.projectMember.findMany({
      where: { userId: userId, status: { in: ['PENDING', 'ACCEPTED'] }},
      include: { project: true },
      orderBy: { project: { departureDate: 'asc' } }
    })
  ]);

  return (
    <div>
      {/* ... */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* 取得したデータをPropsとして渡す */}
          <HostedProjects hostedProjects={hostedProjects} session={session} />
        </div>
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {/* 取得したデータをPropsとして渡す */}
          <MyProjectsList memberships={memberships} />
        </div>
      </div>
    </div>
  );
}
```

### 4.2. 子コンポーネントのProps化（"Dumb Component"化）

`HostedProjects`と`MyProjectsList`からデータ取得ロジックを削除し、Propsで渡されたデータを表示することに専念させます。

**修正後の `components/main/HostedProjects.tsx`**
```tsx
// asyncを外し、propsを受け取る
export default function HostedProjects({ hostedProjects, session }) { 
  // --- auth()とprismaの呼び出しを削除 ---

  const userId = session?.user?.id
  // ...
  // mapで回す対象をpropsの`hostedProjects`に変更
  return (
    <div className="space-y-6 mx-5">
      <h2 className="text-2xl font-bold mb-4">{session.user?.name ?? ""}主催旅行の回答状況</h2>
      {hostedProjects.map((project) => {
        // ...
      })}
    </div>
  )
}
```

## 5. 期待される効果

このリファクタリングにより、以下の効果が期待できます。

-   **パフォーマンスの劇的な向上:** データ取得の回数が最適化され、並列処理によって待ち時間が大幅に短縮されます。
-   **コードの可読性と保守性の向上:** データ取得のロジックが1箇所に集約され、各コンポーネントの責務が明確になります。
-   **将来的なキャッシュ戦略への対応:** 今回の修正は行いませんが、将来的には`layout`から`auth()`を削除し、クライアントサイドで認証情報を扱うことで、ページのキャッシュを有効化する道も開けます。

## 6. 追加の検討事項

今回の調査ではファイルの確認まで至りませんでしたが、`prisma/schema.prisma`ファイルにて、`findMany`の`where`句で使われているカラム（`userId`, `status`, `role`など）に**データベースインデックスが設定されているか**を確認することを強く推奨します。インデックスがない場合、データ量が増えるにつれてクエリのパフォーマンスが著しく低下します。
