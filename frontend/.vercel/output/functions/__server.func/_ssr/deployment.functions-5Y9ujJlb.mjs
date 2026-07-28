import { c as createSsrRpc } from "./router-BcNxq6Cj.mjs";
import { c as createServerFn } from "./server-CNwFEcD6.mjs";
import { r as requireAuth } from "./api-client-CbTdHRmP.mjs";
import { o as objectType, c as booleanType, s as stringType } from "../_libs/zod.mjs";
createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  portfolioId: stringType(),
  provider: stringType(),
  username: stringType()
}).parse(d)).handler(createSsrRpc("5a96b36300d80c9b94470d9cec870d84a7c79d6fe9d3083a25fe163e0c9fa3c3"));
createServerFn({
  method: "GET"
}).middleware([requireAuth]).validator((d) => objectType({
  id: stringType()
}).parse(d)).handler(createSsrRpc("3302f4db9dc9d0e2a5b79b291bae5e1df7d7fb810d4dde080b4b2282316acda6"));
const getDeploymentsByPortfolio = createServerFn({
  method: "GET"
}).middleware([requireAuth]).validator((d) => objectType({
  portfolioId: stringType()
}).parse(d)).handler(createSsrRpc("45d05d2fad21aee54caf78ab859fd4296b739648b175a6526c75082aca969e0a"));
const getPublicPortfolio = createServerFn({
  method: "GET"
}).validator((d) => objectType({
  id: stringType()
}).parse(d)).handler(createSsrRpc("267f3018e5bc392497aa8365f2a04cdf57da4bf7d5457919eae78f2ec3428a65"));
const setPortfolioVisibility = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  portfolioId: stringType(),
  isPublic: booleanType()
}).parse(d)).handler(createSsrRpc("31b37dbb95fa1ab3e5add64cfb32a2a884770843a5ea893fb0c36e8d4c6d4205"));
export {
  getDeploymentsByPortfolio as a,
  getPublicPortfolio as g,
  setPortfolioVisibility as s
};
