import { orderBy } from 'lodash';
import type { WeiboCard, WeiboSendData, WeiboMBlog } from '../qq.types';

/**
 * 过滤微博信息
 * @param { Array<WeiboCard> } cards: 微博信息
 */
export function filterCards(cards: Array<WeiboCard>): Array<WeiboCard> {
  return orderBy<WeiboCard>(
    cards
      // 过滤非发文微博
      .filter((o: WeiboCard): boolean => {
        return o.card_type === 9 && 'mblog' in o;
      })
      .map((item: WeiboCard, index: number): WeiboCard => {
        return Object.assign(item, {
          _id: BigInt(item.mblog.id)
        });
      }),
    ['_id'], ['desc']);
}

/**
 * 过滤新的微博
 * @param { Array<WeiboCard> } list: 过滤后的微博
 * @param { BigInt } weiboId: 记录的微博id
 */
export function filterNewCards(list: Array<WeiboCard>, weiboId: BigInt): Array<WeiboSendData> {
  return list.filter((o: WeiboCard) => BigInt(o.mblog.id) > weiboId)
    .map((item: WeiboCard, index: number): WeiboSendData => {
      const mblog: WeiboMBlog = item.mblog;

      return {
        id: BigInt(mblog.id),
        name: mblog.user.screen_name,
        type: 'retweeted_status' in item.mblog ? '转载' : '原创',
        scheme: item.scheme,
        time: mblog.created_at === '刚刚' ? mblog.created_at : ('在' + mblog.created_at),
        text: mblog.text.replace(/<[^<>]+>/g, ' '),
        pics: (mblog.pics ?? []).map((item: { url: string }) => item.url)
      };
    });
}