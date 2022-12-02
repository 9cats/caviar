declare module MD5 {
  export function generateCaptchaKey(): {
    captchaKey: string;
    token: string;
  };
}

export = MD5;
