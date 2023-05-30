import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "~/types";

type Auth = {
  setUser: (user: User) => void;
  user: User | null;
};

const AuthContext = createContext<Auth>({
  setUser: () => {
    throw new Error("Missing AuthProvider");
  },
  user: null,
});

export const AuthProvider = ({
  user = null,
  children,
}: {
  user?: User | null;
  children: any;
}) => {
  const [value, setValue] = useState<User | null>(user);

  useEffect(() => {
    setValue(value);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user: value,
        setUser: setValue,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useRequiredAuth() {
  const { user, ...params } = useContext(AuthContext);
  if (!user) throw new Error("Not authenticated.");
  return { user, ...params };
}

export default function useAuth() {
  return useContext(AuthContext);
}
