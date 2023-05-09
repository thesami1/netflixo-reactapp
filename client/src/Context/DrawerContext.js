// import React, { createContext, useMemo, useState } from "react";

// export const SidebarContext = createContext();

// function DrawerContext({ children }) {
//   const [mobileDrawer, setMobileDrawer] = useState(false);
//   const toggleDrawer = () => setMobileDrawer(!mobileDrawer);
//   const value = useMemo(() => ({ mobileDrawer, toggleDrawer }), [mobileDrawer]);
//   return (
//     <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
//   );
// }

// export default DrawerContext;


import React, { createContext, useCallback, useMemo, useState } from "react";

export const SidebarContext = createContext();

function DrawerContext({ children }) {
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [progress, setprogress] = useState(0);
  // const toggleDrawer = () => setMobileDrawer(!mobileDrawer);
  // const value = useMemo(
  //   () => ({ mobileDrawer, toggleDrawer, progress, setprogress }),
  //   [mobileDrawer, progress]
  // );
  // const value = useMemo(
  //   () => ({ mobileDrawer, toggleDrawer, progress, setprogress }),
  //   [mobileDrawer, progress, toggleDrawer]
  // );

  const toggleDrawer = useCallback(() => {
    setMobileDrawer(!mobileDrawer);
  }, [mobileDrawer]);
  
  const value = useMemo(() => ({ mobileDrawer, toggleDrawer, progress, setprogress }), [mobileDrawer, progress, toggleDrawer]);
  
  
  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export default DrawerContext;
