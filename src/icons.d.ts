declare module "@icons-pack/react-simple-icons/icons/*.mjs" {
  import * as React from "react";
  const Icon: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> & { title?: string; color?: string; size?: string | number }
  >;
  export default Icon;
  export const defaultColor: string;
}
