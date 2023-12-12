import cloneDeep from "lodash.clonedeep";

class IssueParser {
  parseIssues(issues: any) {
    const { length } = issues;
    const map: {[key: string]: any} = {};

    if (length === 0) {
      return map;
    }

    for (let i = 0; i < length; ++i) {
      const issue = issues[i];
      const mappedIssue = this.getIssueFromMap(issue.issue, map);
      const issueExists = !!mappedIssue;

      if (!issueExists && !issue.parent) {
        this.setIssue({
          ...issue,
          children: {},
        }, map);
      }

      if (issueExists && !issue.parent) {
        this.setIssue({
          ...issue,
          ...cloneDeep<{[key: string]: string}>(map[issue.issue]),
        }, map);
      }

      if (!issueExists && issue.parent) {
        this.setIssue({
          ...issue,
          children: {},
        }, map, issue.parent);
      }

      if (issueExists && issue.parent) {
        const issueCopy = cloneDeep(mappedIssue);

        // Issue should be at top level if it already exists
        delete map[issueCopy.issue];
        this.setIssue({
          ...issue,
          ...issueCopy,
        }, map, issue.parent);
      }
    }

    return map;
  }

  getIssueFromMap(issue: any, map: any): any {
    let foundIssue = null;
    const keys = Object.keys(map);
    for (let i = 0; i < keys.length; ++i) {
      const selectedIssue = keys[i];

      if (selectedIssue === issue) {
        foundIssue = map[selectedIssue];
        break;
      }

      const recursiveIssueSearch = this.getIssueFromMap(issue, map[selectedIssue].children);

      if (recursiveIssueSearch) {
        foundIssue = recursiveIssueSearch;
        break;
      }
    }

    return foundIssue;
  }

  setIssue(issue: any, map: any, parent = null) {
    if (parent === null) {
      map[issue.issue] = issue;
      return;
    }

    const parentExists = !!this.getIssueFromMap(parent, map);

    if (!parentExists) {
      map[parent] = {
        issue: parent,
        children: {
          [issue.issue]: issue,
        },
      };

      return;
    }

    const setIssueRecursive = (parentIssue: any, childIssue: any, issueMap: any) => {
      let isSet = false;
      const keys = Object.keys(issueMap);

      for (let i = 0; i < keys.length; ++i) {
        const selectedIssue = keys[i];
        if (parentIssue === selectedIssue) {
          issueMap[selectedIssue].children[childIssue.issue] = childIssue;
          isSet = true;
          break;
        }

        if (setIssueRecursive(parentIssue, childIssue, issueMap[selectedIssue].children)) {
          isSet = true;
          break;
        }
      }

      return isSet;
    };

    setIssueRecursive(parent, issue, map);
  }
}

export default IssueParser;
