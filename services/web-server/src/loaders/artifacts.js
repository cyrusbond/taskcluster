import sift from '../utils/sift';
import ConnectionLoader from '../ConnectionLoader';
import Artifacts from '../entities/Artifacts';

export default ({ queue }, isAuthed, rootUrl, monitor, strategies, req, cfg, requestId) => {
  const artifacts = new ConnectionLoader(
    async ({ taskId, runId, filter, options }) => {
      const raw = await queue.listArtifacts(taskId, runId, options);
      const artifacts = sift(filter, raw.artifacts);

      return new Artifacts(taskId, runId, { ...raw, artifacts });
    },
  );
  const latestArtifacts = new ConnectionLoader(
    async ({ taskId, filter, options }) => {
      const raw = await queue.listLatestArtifacts(taskId, options);
      const artifacts = sift(filter, raw.artifacts);

      return new Artifacts(taskId, null, { ...raw, artifacts });
    },
  );

  return {
    artifacts,
    latestArtifacts,
  };
};
