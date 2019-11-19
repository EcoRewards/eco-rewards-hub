import { ApiContainer } from "./service/ApiContainer";

const container = new ApiContainer();

container
  .getKoaService()
  .then(service => service.start())
  .catch(e => console.error(e));
