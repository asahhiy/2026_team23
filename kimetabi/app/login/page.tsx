import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import SignIn from "@/components/sign-in";
import BackgroundImageSlideshow from "@/components/ui/BackgroundImageSlideshow";

export default function LoginPage() {
  return (
    // relative と overflow-hidden を追加して、背景がはみ出さないようにします
    <div className="relative min-h-screen items-center justify-center flex overflow-hidden">
      
      <BackgroundImageSlideshow />

      {/* ここからは元のコードを維持しています。
          背景との重なり順を制御するため、一番外側の div に relative z-10 を追加しました。
      */}
      <div className="relative z-10 flex w-full items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-[0_35px_60px_-15px_rgba(66,96,45,0.3)] border-none overflow-hidden bg-[#42602D] text-white">
          
          <div className="h-1 bg-white/10 w-full" />

          <CardHeader className="pt-12 pb-4 text-center">
            <div className="flex justify-center mb-8 px-6">
              <img 
                src="/logo.png" 
                alt="キメ旅っ！" 
                className="w-full h-auto max-w-[280px] object-contain transition-transform hover:scale-105 duration-500"
              />
            </div>
            
            <CardDescription className="text-base text-white/80 font-medium leading-relaxed tracking-wide">
              3ヶ月前からの準備で、<br />
              最高の旅行を、最高の仲間と。
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-12 px-10 text-center">
            <div className="space-y-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
                  <span className="bg-[#42602D] px-4 text-white/40">Authentication</span>
                </div>
              </div>

              <div className="flex justify-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-inner transition-all hover:bg-white/10">
                  <SignIn />
              </div>

              <p className="text-[10px] text-white/30 leading-relaxed font-light">
                ログインすることで、利用規約および<br />
                プライバシーポリシーに同意したものとみなされます。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}