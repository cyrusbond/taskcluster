import sift from '../utils/sift';
import ConnectionLoader from '../ConnectionLoader';

export default ({ index }, isAuthed, rootUrl, monitor, strategies, req, cfg, requestId) => {
  const namespaces = new ConnectionLoader(
    async ({ namespace, options, filter }) => {
      const raw = await index.listNamespaces(namespace, options);

      return {
        ...raw,
        items: sift(filter, raw.namespaces),
      };
    },
  );
  const taskNamespace = new ConnectionLoader(
    async ({ namespace, options, filter }) => {
      const raw = await index.listTasks(namespace, options);

      return {
        ...raw,
        items: sift(filter, raw.tasks),
      };
    },
  );

  return {
    namespaces,
    taskNamespace,
  };
};
