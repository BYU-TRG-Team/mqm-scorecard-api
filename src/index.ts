import { constructApp } from "./app";

let port: any;
const app = constructApp();

if (process.env.APP_ENV === "development") {
  port = 8081;
} else {
  port = process.env.PORT || 3000;
}

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
