import { ServiceContainer } from "./service/ServiceContainer";

const container = new ServiceContainer();

container
  .getKoaService()
  .then(service => service.start())
  .then(() => container.getJourneyProcessingJob())
  .then(() => container.getDatabaseBackupJob())
  .then(scheduler => scheduler.start())
  .catch(e => console.error(e));
