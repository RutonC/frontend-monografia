import { useRef } from "react";
import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";


type TitleState = {
  title:string;
  setTitle:(v:string)=>void;
  reset:()=>void;
}

function createTitleStore (initial = "") {
  return createStore<TitleState>((set)=>({
    title:initial,
    setTitle:(v)=>set({title:v}),
    reset:()=>set({title:""})
  }));
}

  /**
   * Cada component que chamar este hook ganha UMA instância privada do store.
   * Não precisa de Provider, nem cria estado global.
   */

  export function useTitle(initial = ""){
    const storeRef = useRef<StoreApi<TitleState> | null>(null);
    if(!storeRef.current){
      storeRef.current = createTitleStore(initial)
    }
    
    //useStore "assina" o store desta instância
    return useStore(storeRef.current, (s)=>s.title);
  }
