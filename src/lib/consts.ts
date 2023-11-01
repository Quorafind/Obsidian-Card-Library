//eslint-disable-next-line
export const TAG_REG = /\s#([\p{Letter}\p{Emoji_Presentation}\p{Number}\/_-]+)/gu;
//eslint-disable-next-line
export const FIRST_TAG_REG = /(<p>|<br>)#([\p{Letter}\p{Emoji_Presentation}\p{Number}\/_-]+)/gu;
//eslint-disable-next-line
export const NOP_FIRST_TAG_REG = /^#([\p{Letter}\p{Emoji_Presentation}\p{Number}\/_-]+)/gu;
