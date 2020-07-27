const path = require('path');
const { Schema } = require('taskcluster-lib-postgres');
const {modifyRepoFile} = require('../../utils');

exports.tasks = [{
  title: '`db/versions/README`',
  requires: ['db-schema-serializable'],
  provides: ['db-versions-readme'],
  run: async (requirements, utils) => {
    const schema = Schema.fromSerializable(requirements['db-schema-serializable']);

    const table = [];
    table.push('| DB Version | Description |');
    table.push('| --- | --- |');

    for (let version of schema.versions) {
      const zpad = version.version.toString().padStart(4, '0');
      table.push(`| [${zpad}](./${zpad}.yml) | ${version.description || ''} |`);
    }

    await modifyRepoFile(path.join('db', 'versions', 'README.md'),
      content => content.replace(
        /(<!-- AUTOGENERATED DO NOT EDIT -->)(?:.|\n)*(<!-- AUTOGENERATED DO NOT EDIT - END -->)/m,
        `$1\n${table.join('\n')}\n$2`));
  },
}];
