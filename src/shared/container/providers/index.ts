import { container } from "tsyringe";

import { IDateProvider } from "./DateProvider/IDateProvider";
import { DayjsDateProvider } from "./DateProvider/implementations/DayjsDateProvider";
import "./StorageProvider";
import "./MailProvider";

container.registerSingleton<IDateProvider>("DateProvider", DayjsDateProvider);
