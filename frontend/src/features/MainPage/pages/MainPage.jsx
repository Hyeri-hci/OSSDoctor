import React from "react";

export default function MainPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-primary">
      <h1 className="text-4xl font-bold mb-4 text-red-600">Main Page</h1>
      <p className="text-lg text-accent text-blue-600">Tailwind 정상 적용 확인.</p>
        <a href={"https://github.com/login/oauth/authorize?client_id=Iv23li5SWPbWBI5N68H8"}>github 로그인 이동</a>
    </div>
  );
}

MainPage.displayName = "MainPage";