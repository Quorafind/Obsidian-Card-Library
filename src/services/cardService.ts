import { FIRST_TAG_REG, NOP_FIRST_TAG_REG, TAG_REG } from '@/lib/consts';
import appStore from '@/stores/appStore';
import { moment, TFile } from 'obsidian';
import {
  createCardInCanvas,
  deleteCardInCanvas,
  getAllCards,
  getAvailableEdges,
  getCardFromCanvas,
  getDeletedCardsInCards,
  getLinkedCard,
  showMemoInCanvas,
  updateCardInFile,
  updateFile,
} from '@/lib/obsidianUtils';

class CardService {
  public initialized = false;

  public getState() {
    return appStore.getState().cardState;
  }

  public async getCards() {
    const cards = await getAllCards();

    appStore.dispatch({
      type: 'SET_CARDS',
      payload: {
        cards,
      },
    });

    if (!this.initialized) {
      this.initialized = true;
    }

    return cards;
  }

  public async getDeletedCards() {
    const cards = await getDeletedCardsInCards(this.getState().cards);
    cards.sort((a: Model.Card, b: Model.Card) => moment(b.deletedAt).unix() - moment(a.deletedAt).unix());
    return cards;
  }

  public async getEdgesLinkedCard(cards: Model.Card[], ids: string[]) {
    // Group cards by path
    const cardsByPath = cards.reduce((acc, card) => {
      if (!acc[card.path]) {
        acc[card.path] = [];
      }
      acc[card.path].push(card);
      return acc;
    });
    const edges = [];
    // use getAvailableEdges to get all edges and linked cards, based on path
    for (const path in cardsByPath) {
      const { edges: availableEdges, linkedNodes } = await getAvailableEdges(path, ids);
      edges.push(...availableEdges);
      // update linked cards
      for (const linkedNode of linkedNodes) {
        if (ids.includes(linkedNode.id)) continue;
        // cards.push();
      }
    }
  }

  public async editCard(card: Model.Card) {
    appStore.dispatch({
      type: 'EDIT_CARD',
      payload: card,
    });
  }

  public pushCard(card: Model.Card) {
    appStore.dispatch({
      type: 'INSERT_CARD',
      payload: {
        card: {
          ...card,
        },
      },
    });
  }

  public async duplicateCard(card: Model.Card) {
    const newCard = await createCardInCanvas({
      content: card.content,
      type: card.type,
      path: card.path,
    });
    appStore.dispatch({
      type: 'INSERT_CARD',
      payload: {
        card: {
          ...newCard,
        },
      },
    });
  }

  public async getLinkedCard({ id, path }: { id: string; path: string }) {
    return await getLinkedCard(path, id);
  }

  public async revealCard(card: Model.Card) {
    await showMemoInCanvas(card.id, card.path);
  }

  public getCardById(id: string): Model.Card | null {
    const cards = this.getState().cards;
    const card = cards.find((c) => c.id === id);
    console.log(card, id);
    if (card) return card;

    return null;
  }

  public async archiveCard(oldCard: Model.Card) {
    let newCard = null;

    newCard = await updateCardInFile(oldCard, {
      id: oldCard.id,
      rowStatus: 'ARCHIVED',
    });

    if (!newCard) return oldCard;
    appStore.dispatch({
      type: 'ARCHIVE_CARD_BY_ID',
      payload: newCard,
    });
  }

  public async unarchiveMemo(oldCard: Model.Card) {
    let newCard = null;

    newCard = await updateCardInFile(oldCard, {
      id: oldCard.id,
      rowStatus: 'NORMAL',
    });

    appStore.dispatch({
      type: 'UNARCHIVE_CARD_BY_ID',
      payload: newCard,
    });
  }

  public async hideMemoById(id: string) {
    const oldCard = this.getCardById(id);
    if (!oldCard) return oldCard;
    let newCard = null;

    newCard = await updateCardInFile(oldCard, {
      id: oldCard.id,
      deleted: true,
    });

    if (!newCard) return oldCard;
    if (newCard) {
      appStore.dispatch({
        type: 'EDIT_CARD',
        payload: newCard,
      });
      return newCard;
    }
  }

  public async restoreCardById(id: string) {
    const oldCard = this.getCardById(id);
    const newCard = await updateCardInFile(oldCard, {
      id: oldCard.id,
      deleted: false,
    });
    appStore.dispatch({
      type: 'EDIT_CARD',
      payload: newCard,
    });
    return;
  }

  public async deleteMemoById(id: string) {
    const oldCard = this.getCardById(id);
    try {
      await deleteCardInCanvas(oldCard);

      appStore.dispatch({
        type: 'DELETE_CARD_BY_ID',
        payload: {
          id: id,
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  public async removeCardsInFile(file: TFile) {
    const cards: Model.Card[] = [];
    try {
      await getCardFromCanvas(file, cards);
      const deletedIDS = cards.map((m) => m.id);
      appStore.dispatch({
        type: 'DELETE_CARD_BY_ID_BATCH',
        payload: {
          ids: deletedIDS,
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  public async updateCardsBatch(file: TFile) {
    const cards: Model.Card[] = [];
    try {
      await getCardFromCanvas(file, cards);
      if (cards.length > 0) {
        appStore.dispatch({
          type: 'UPDATE_CARD_BATCH',
          payload: {
            cards,
            path: file.path,
          },
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  public async deleteCardsBatch(file: TFile) {
    const cards: Model.Card[] = [];
    try {
      await getCardFromCanvas(file, cards);
      const deletedIDS = cards.map((m) => m.id);
      appStore.dispatch({
        type: 'DELETE_CARD_BY_ID_BATCH',
        payload: {
          ids: deletedIDS,
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  public requestCardUpdate(card: Model.Card) {
    appStore.dispatch({
      type: 'EDIT_CARD',
      payload: card,
    });
  }

  public updateTagsState() {
    const { cards } = this.getState();
    const tagsSet = new Set<string>();
    const counts = {} as {
      [key: string]: number;
    };

    for (const memo of cards) {
      const content = memo.content;
      const tags = [
        ...Array.from(content.match(TAG_REG) ?? []),
        ...Array.from(content.match(NOP_FIRST_TAG_REG) ?? []),
        ...Array.from(content.match(FIRST_TAG_REG) ?? []),
      ];

      tags.forEach((tag) => {
        const cleanedTag = tag
          .replace(TAG_REG, '$1')
          .replace(NOP_FIRST_TAG_REG, '$1')
          .replace(FIRST_TAG_REG, '$2')
          .trim();
        tagsSet.add(cleanedTag);

        // 直接在这里统计 tag 的出现次数
        counts[cleanedTag] = (counts[cleanedTag] || 0) + 1;
      });
    }

    appStore.dispatch({
      type: 'SET_TAGS',
      payload: {
        tags: Array.from(tagsSet),
        tagsNum: counts,
      },
    });
  }

  public clearCards() {
    appStore.dispatch({
      type: 'SET_CARDS',
      payload: {
        cards: [],
      },
    });
  }

  public async createCard({
    text,
    type,
    path,
    patch,
  }: {
    text: string;
    type: CardSpecType;
    path?: string;
    patch?: CardPatch;
  }): Promise<Model.Card> {
    return await createCardInCanvas({
      content: text,
      type,
      path,
      patch,
    });
  }

  public async pinCardById(id: string) {
    const card = await this.patchCardViaID(id, {
      id,
      pinned: true,
    });
    appStore.dispatch({
      type: 'PIN_CARD',
      payload: card,
    });
  }

  public async unpinCardById(id: string) {
    const newCard = await this.patchCardViaID(id, {
      id,
      pinned: false,
    });
    appStore.dispatch({
      type: 'PIN_CARD',
      payload: newCard,
    });
  }

  public async patchCard(oldCard: Model.Card, patch: CardPatch): Promise<Model.Card> {
    if (oldCard) {
      let newCard = null;
      newCard = await updateCardInFile(newCard, {
        ...patch,
      });
      if (newCard) {
        return newCard;
      }
    }
    return oldCard;
  }

  public async patchFileCard(id: string, patch: CardPatch) {
    const path = this.getCardById(id)?.content;
    await updateFile(path, {
      content: patch.content,
    });
    return this.getCardById(id);
  }

  public async patchCardViaID(id: string, patch: CardPatch): Promise<Model.Card> {
    const oldCard = this.getCardById(id);
    if (oldCard) {
      let newCard = null;
      newCard = await updateCardInFile(oldCard, patch);
      if (newCard) {
        return newCard;
      }
    }
    return oldCard;
  }
}

const cardService = new CardService();

export default cardService;
