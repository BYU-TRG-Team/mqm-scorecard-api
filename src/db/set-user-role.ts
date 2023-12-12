import "dotenv/config";
import { constructBottle } from "../bottle";
import { roles } from "../roles";

const updateUserRoleQuery = "UPDATE users SET role_id=$1 WHERE username=$2";
const usage = `Usage: npm run db:set-user-role <username> <role id>
Valid role id: 1 (user) | 2 (admin) | 3 (superadmin)`
const username = process.argv[2]
const roleId = process.argv[3]
const bottle = constructBottle();

if (process.argv.length !== 4) {
  throw new Error(usage)
}

if (roles[roleId] === undefined) {
  throw new Error(usage)
}

(async function seedDatabase() {
  await bottle.container.DBClientPool.connectionPool.query(updateUserRoleQuery, [roleId, username])
  await bottle.container.DBClientPool.connectionPool.end();
  console.log(`Successfully updated user "${username}" to ${roles[roleId]}.`);
}());



