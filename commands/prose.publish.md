---
identifier: speckit.prose-lang.publish
description: Version, tag, and release a Prose-Lang project via Git.
---

# prose.publish

Use this command to release the project.

## Procedure

1. **Pre-flight** — Run the **prose.test** workflow first. **Stop** if any test fails.

2. **Versioning**:
   * Read the current version in the `.prose` file.
   * Increment it based on the user's request (`major` / `minor` / `patch`).
   * Update the `.prose` file text with the new version.

3. **Tag & Push**:
   * `git add .`
   * `git commit -m "Release v[Version]"`
   * `git tag v[Version]`
   * `git push --tags`
   * (Optional) If Docker, run `docker push [tag]`.
