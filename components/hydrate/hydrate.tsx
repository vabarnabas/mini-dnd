import { useEffect, useState } from "react";

interface Props {
  children: JSX.Element | JSX.Element[];
}

const Hydrate = ({ children }: Props) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return <>{isHydrated ? <div>{children}</div> : null}</>;
};

export default Hydrate;
