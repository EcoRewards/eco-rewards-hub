import { ApiContainer } from "./service/ApiContainer";

const container = new ApiContainer();

container
  .getKoaService()
  .start();
