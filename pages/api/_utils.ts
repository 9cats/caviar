/* 获得几天后的日期 */
export function getRelativeDate(dxrq: string) {
  let time_server = new Date(); //server 时间
  let time = new Date(time_server.getTime() + (parseInt(dxrq) * 24 + 8) * 60 * 60 * 1000); //北京时间

  let year = time.getFullYear();
  let month = (time.getMonth() + 1).toString().padStart(2, "0"); //左边需要补0
  let day = time.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}