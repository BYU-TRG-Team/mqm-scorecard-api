interface ParsedBitextFile { 
  segments: any[]; 
  targetWordCount: number; 
  sourceWordCount: number; 
}

class FileParser {
  parseMetricFile(node: any, parent: any, level = -1): [string, any[]] {
    let error = "";
    const issues = new Array<any>();

    if (level > 3) {
      error = "Error reading metric file: issues can not be more than three levels deep";
      return [error, issues];
    }

    if (level > -1) {
      if (!node.$ || !node.$.type) {
        error = "Error reading metric file: issue must have a type attribute";
        return [error, issues];
      }

      if (!node.$ || !node.$.display || !["yes", "no"].includes(node.$.display.toLowerCase())) {
        error = "Error reading metric file: issue must have a display attribute";
        return [error, issues];
      }

      issues.push({
        issue: node.$.type,
        display: node.$.display.toLowerCase() === "yes",
        parent,
      });
    }

    if (node.issue && node.issue.length !== 0) {
      for (let i = 0; i < node.issue.length; ++i) {
        const childNode = node.issue[i];
        let childNodeParent = null;

        if (node.$ && node.$.type) {
          childNodeParent = node.$.type;
        }

        const [err, childIssues] = this.parseMetricFile(childNode, childNodeParent, level + 1);

        if (err) {
          error = err;
          break;
        }

        issues.push(...childIssues);
      }
    }

    return [error, issues];
  }

  parseTypologyFile(node: any, parent:any = undefined, level = -1): [string, any[]] {
    let error = "";
    const issueTypes = new Array<any>();

    if (level > 3) {
      error = "Error reading typology file: error types can not be more than three levels deep";
      return [error, issueTypes];
    }

    if (level > -1) {
      let description = "";
      let notes = "";
      let examples = "";

      if (!node.$.name) {
        error = "Error reading typology file: error type must have a name attribute";
        return [error, issueTypes];
      }

      if (!node.$.id) {
        error = "Error reading typology file: error type must have an id attribute";
        return [error, issueTypes];
      }

      if (node.description) {
        if (!Array.isArray(node.description)) {
          error = "Error reading typology file: \"description\" element cannot have any attributes.";
          return [error, issueTypes];
        }
        [description] = node.description;
      }

      if (node.examples) {
        if ((!Array.isArray(node.examples))) {
          error = "Error reading typology file: \"examples\" element cannot have any attributes.";
          return [error, issueTypes];
        }
        [examples] = node.examples;
      }

      if (node.notes) {
        if ((!Array.isArray(node.notes))) {
          error = "Error reading typology file: \"notes\" element cannot have any attributes.";
          return [error, issueTypes];
        }
        [notes] = node.notes;
      }

      issueTypes.push({
        id: node.$.id,
        name: node.$.name,
        description,
        examples,
        notes,
        parent,
      });
    }

    if (node.errorType && node.errorType.length !== 0) {
      for (let i = 0; i < node.errorType.length; ++i) {
        const childNode = node.errorType[i];
        let childNodeParent = null;

        if (level > -1) {
          childNodeParent = node.$.id;
        }

        const [err, childIssueTypes] = this.parseTypologyFile(childNode, childNodeParent, level + 1);

        if (err) {
          error = err;
          break;
        }

        issueTypes.push(...childIssueTypes);
      }
    }

    return [error, issueTypes];
  }

  parseBiColumnBitext(file: any): [string, ParsedBitextFile] {
    let error = "";
    const fileHeaders = ["Source", "Target"];
    const lines = file.split("\n");
    const response: ParsedBitextFile = {
      segments: new Array<any>(),
      targetWordCount: 0,
      sourceWordCount: 0,
    };

    if (lines.length === 1) {
      error = "Error reading bitext file: File is blank";
      return [error, response];
    }

    const numColumns = lines[0].split("\t").length;

    if (numColumns < 2) {
      error = "Error reading bitext file: File must have two or more columns";
      return [error, response];
    }

    lines.forEach((line: any, index: any) => {
      if (line.length === 0 || line.trim().length === 0) {
        return;
      }

      const text = line.split("\t");

      if (text.length !== numColumns) {
        error = `Error reading bitext file in line ${index + 1}`;
        return;
      }

      if (index === 0 && numColumns > 2) {
        const headers = text.slice(2, numColumns);
        fileHeaders.push(...headers);
        return;
      }

      const specificationObject: {[key: string]: string} = {};
      text.forEach((str: any, i: any) => {
        const wordCount = str.split(" ").length;
        if (i === 0) {
          response.sourceWordCount += wordCount;
        }

        if (i === 1) {
          response.targetWordCount += wordCount;
        }

        specificationObject[fileHeaders[i]] = str;
      });

      response.segments.push(specificationObject);
    });

    return [error, response];
  }

  parseSpecificationsFile(node: any) {
    const specificationsJSON = { specifications: new Array<any>() };

    try {
      node.sts.section.forEach((section: any) => {
        const newSpecification = { name: "", sections: new Array<any>() };
        newSpecification.name = section.$.name;

        section.parameter.forEach((param: any) => {
          const newSection = { name: "", subsections: new Array<any>() };
          newSection.name = `[${param.$.number}] ${param.$.name}`;

          param.subparameter.forEach((subparam: any) => {
            const newSubsection = { name: "", contentList: new Array<any>() };
            newSubsection.name = `[${subparam.$.number}] ${subparam.$.name}`;

            subparam.value.forEach((val: any) => {
              newSubsection.contentList.push(val);
            });

            newSection.subsections.push(newSubsection);
          });

          newSpecification.sections.push(newSection);
        });

        specificationsJSON.specifications.push(newSpecification);
      });

      return ["", JSON.stringify(specificationsJSON)];
    } catch (error) {
      return ["Error parsing specifications file", ""];
    }
  }
}

export default FileParser;
