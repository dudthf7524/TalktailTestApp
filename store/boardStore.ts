import { create } from "zustand";
import axios from "axios";
import { API_URL } from "../Component/constant/contants";
import { getToken } from "../utils/storage";

interface BoardData {
  board_code: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
}

interface BoardState {
    board: BoardData | null;
    boardLists: BoardData[];
    loadAllLoading: boolean;
    loadAllError: string | null;
    loadLoading: boolean;
    loadError: string | null;
    loadAllBoard: () => Promise<void>;
    loadBoard: (board_code: string) => Promise<void>;
}

export const boardStore = create<BoardState>((set) => ({
  board: null,
  boardLists: [],
  loadAllLoading: false,
  loadAllError: null,
  loadLoading: false,
  loadError: null,
  loadAllBoard: async () => {
    set({ loadAllLoading: true });
    try {
      const token = getToken();
      if(!token) {
        throw new Error("토큰이 없습니다.");
      }
      const response = await axios.get(`${API_URL}/board/loadAll`, {
      });
      set({ boardLists: response.data }); 
    } catch(e) {
      console.error(e);
    }
  },
  loadBoard: async (board_code: string) => {
    set({ loadLoading: true });
    try {
      const token = getToken();
      if(!token) {
        throw new Error("토큰이 없습니다.");
      }
      const response = await axios.post(`${API_URL}/board/load`, {
        board_code: board_code,
      });
      set({ board: response.data }); 
    } catch(e) {
      console.error(e);
    }
  }
}));
