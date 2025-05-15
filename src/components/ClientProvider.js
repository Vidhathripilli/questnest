
"use client"; // Make sure this is here!

import { Provider } from "react-redux";
import { store } from "../store/store";


export default function ClientProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
