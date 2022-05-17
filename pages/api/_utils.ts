/* 获得几天后的日期 */
//TODO： 本函数只能供羽毛球使用，图书馆不确定是否能够使用
export function getRelativeDate(dxrq: string) {
  let time_server = new Date(); //server 时间
  let time = new Date(time_server.getTime() + parseInt(dxrq) * 24 * 60 * 60 * 1000); //北京时间

  let year = time.getFullYear();
  let month = (time.getMonth() + 1).toString().padStart(2, "0"); //左边需要补0
  let day = time.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getTime() {
  let time = new Date(); //server 时间

  let year = time.getFullYear()
  let month = (time.getMonth() + 1).toString().padStart(2, "0")
  let day = time.getDate().toString().padStart(2, "0")
  let hour = time.getHours().toString().padStart(2, "0")
  let minute = time.getMinutes().toString().padStart(2, "0")
  let second = time.getSeconds().toString().padStart(2, "0")
  let millisecond = time.getMilliseconds().toString().padStart(3, "0")

  return `${year}-${month}-${day} ${hour}:${minute}:${second} ${millisecond}`
}