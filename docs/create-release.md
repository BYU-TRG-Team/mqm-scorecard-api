# Create a release from the main branch

## 1. Create release commit

From your local, bump the package version with `npm version <action>`. This creates a new commit.

This commit should now be merged to remote main branch.

## 2. Create a GitHub release

Create a new GitHub release, configured with a new tag `v<x>.<y>.<x>`. **Generate release notes** can be used. 

**Please note any updates to the database configuration.**

If merging from a branch, please delete the branch.

## 3. Create a release branch

Create a new remote branch formatted as `v<x>.<y>.<x>` using main branch as source.

## 4. Deploy new version (optional)

### New deployment

See the [Deploy Heroku stack guide](deploy-heroku-stack.md).








