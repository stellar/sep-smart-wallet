import { ComponentProps } from "react";
import { Link as RLink } from "react-router-dom";
import { Link } from "@stellar/design-system";

type RouterLinkProps = ComponentProps<typeof Link> & {
  to: string;
};

export const RouterLink = (props: RouterLinkProps) => {
  const { to, ...rest } = props;

  return <Link customAnchor={<RLink to={to} />} {...rest} />;
};
