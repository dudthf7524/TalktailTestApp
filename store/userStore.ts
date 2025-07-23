import {create} from 'zustand';
import axios from 'axios';
import {API_URL} from '../Component/constant/contants';
import {getToken} from '../utils/storage';

export interface Pet {
  device_code: string;
  pet_code: string;
  name: string;
  birth: string;
  breed: string;
  gender: boolean;
  neutered: boolean;
  disease: string;
  history: string;
  admission: string;
  species: string;
  weight: string;
  vet: string;
}

interface PetFormData {
  name: string;
  birth: string;
  breed: string;
  gender: boolean;
  neutered: boolean;
  disease: string;
  history: string;
  admission: string;
  species: string;
  weight: string;
  vet: string;
  device_code: string;
}

interface UserStore {
  pets: Pet[];
  loadLoading: boolean;
  loadError: string | null;
  loadSuccess: boolean;
  registerLoading: boolean;
  registerError: string | null;
  registerSuccess: boolean;
  updateLoading: boolean;
  updateError: string | null;
  updateSuccess: boolean;
  deleteLoading: boolean;
  deleteError: string | null;
  deleteSuccess: boolean;
  fetchPets: () => Promise<void>;
  registerPet: (formData: PetFormData) => Promise<void>;
  updatePet: (petData: any) => Promise<void>;
  deletePet: (petCode: string) => Promise<void>;
  offLoadSuccess: () => void;
  offLoadError: () => void;
  offRegisterSuccess: () => void;
  offRegisterError: () => void;
  offUpdateSuccess: () => void;
  offUpdateError: () => void;
  offDeleteSuccess: () => void;
  offDeleteError: () => void;
}

export const userStore = create<UserStore>((set, get) => ({
  pets: [],
  loadLoading: false,
  loadError: null,
  loadSuccess: false,
  registerLoading: false,
  registerError: null,
  registerSuccess: false,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
  deleteLoading: false,
  deleteError: null,
  deleteSuccess: false,

  fetchPets: async () => {
    try {
      set({loadLoading: true, loadError: null, loadSuccess: false});
      const token = await getToken();
      if (!token) {
        throw new Error('토큰이 없습니다.');
      }

      const response = await axios.post(`${API_URL}/pet/load`, {
        device_code: token.device_code,
      });

      set({pets: response.data, loadLoading: false, loadSuccess: true});
    } catch (error) {
      set({
        loadError:
          error instanceof Error
            ? error.message
            : '동물 데이터를 가져오는데 실패했습니다.',
        loadLoading: false,
        loadSuccess: false,
      });
      throw error;
    }
  },

  registerPet: async (formData: PetFormData) => {
    try {
      set({registerLoading: true, registerError: null, registerSuccess: false});
      const response = await axios.post(`${API_URL}/pet/register`, formData);

      if (response.status === 200) {
        const token = await getToken();
        if (!token) {
          throw new Error('토큰이 없습니다.');
        }
        const petsResponse = await axios.post(`${API_URL}/pet/load`, {
          device_code: token.device_code,
        });
        set({
          pets: petsResponse.data,
          registerLoading: false,
          registerSuccess: true,
        });
      }
    } catch (error) {
      set({
        registerError:
          error instanceof Error ? error.message : '동물 등록에 실패했습니다.',
        registerLoading: false,
        registerSuccess: false,
      });
      throw error;
    }
  },

  updatePet: async (petData: any) => {
    try {
      set({updateLoading: true, updateError: null, updateSuccess: false});
      const token = await getToken();
      if (!token) {
        throw new Error('토큰이 없습니다.');
      }
      const response = await axios.post(`${API_URL}/pet/update`, {
        token,
        ...petData,
      });
      if (response.status === 200) {
        const petsResponse = await axios.post(`${API_URL}/pet/load`, {
          device_code: token.device_code,
        });
        set({
          pets: petsResponse.data,
          updateLoading: false,
          updateSuccess: true,
        });
      }
    } catch (error: any) {
      console.error(error);
      set({
        updateLoading: false,
        updateSuccess: false,
        updateError:
          error.response?.data?.message || '동물 정보 수정에 실패했습니다.',
      });
      throw error;
    }
  },

  deletePet: async (petCode: string) => {
    try {
      set({deleteLoading: true, deleteError: null, deleteSuccess: false});
      const token = await getToken();
      if (!token) {
        throw new Error('토큰이 없습니다.');
      }

      const response = await axios.post(`${API_URL}/pet/delete`, {
        device_code: token.device_code,
        pet_code: petCode,
      });

      if (response.status === 200) {
        const petsResponse = await axios.post(`${API_URL}/pet/load`, {
          device_code: token.device_code,
        });
        set({
          pets: petsResponse.data,
          deleteLoading: false,
          deleteSuccess: true,
        });
      }
    } catch (error) {
      set({
        deleteError:
          error instanceof Error ? error.message : '동물 삭제에 실패했습니다.',
        deleteLoading: false,
        deleteSuccess: false,
      });
      throw error;
    }
  },

  confirmPassword: async (password: string) => {
    const token = await getToken();
    if (!token) {
      throw new Error('토큰이 없습니다.');
    }
    const response = await axios.post(`${API_URL}/user/confirmPassword`, {
      token,
      password,
    });
    console.log(response.status);
  },

  offLoadSuccess: () => {
    set({loadSuccess: false});
  },
  offLoadError: () => {
    set({loadError: null});
  },
  offRegisterSuccess: () => {
    set({registerSuccess: false});
  },
  offRegisterError: () => {
    set({registerError: null});
  },
  offUpdateSuccess: () => set({updateSuccess: false}),
  offUpdateError: () => set({updateError: null}),
  offDeleteSuccess: () => {
    set({deleteSuccess: false});
  },
  offDeleteError: () => {
    set({deleteError: null});
  },
}));
 