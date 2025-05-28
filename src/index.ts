import { constructApp } from "./app";
import cors from "cors";

const app = constructApp();

app.use(cors());

app.listen(8081, () => {
  console.log(`App listening on port 8081`);
});
