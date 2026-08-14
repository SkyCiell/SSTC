import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../config/db.js';

// Create a new project
export async function createProject(req, res) {
  try {
    const { name, originalImage, framework, generatedCode } = req.body;

    if (!originalImage || !generatedCode) {
      return res.status(400).json({ error: 'Original image and generated code are required.' });
    }

    const projectId = uuidv4();
    const projectName = name || `Project ${new Date().toLocaleDateString('id-ID')}`;
    const targetFramework = framework || 'react-tailwind';
    const db = getDb();

    if (db.isFallback) {
      // In-Memory fallback implementation
      const project = {
        id: projectId,
        name: projectName,
        original_image: originalImage,
        framework: targetFramework,
        generated_code: generatedCode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const initialVersion = {
        id: 1,
        project_id: projectId,
        code: generatedCode,
        version: 1,
        created_at: new Date().toISOString(),
      };

      db.inMemoryDb.projects.set(projectId, project);
      db.inMemoryDb.versions.set(projectId, [initialVersion]);

      return res.status(201).json({
        success: true,
        project,
        versions: [initialVersion],
      });
    }

    // MySQL implementation
    await db.query(
      `INSERT INTO projects (id, name, original_image, framework, generated_code) VALUES (?, ?, ?, ?, ?)`,
      [projectId, projectName, originalImage, targetFramework, generatedCode]
    );

    await db.query(
      `INSERT INTO project_versions (project_id, code, version) VALUES (?, ?, 1)`,
      [projectId, generatedCode]
    );

    const [rows] = await db.query(`SELECT * FROM projects WHERE id = ?`, [projectId]);
    const [versionRows] = await db.query(
      `SELECT * FROM project_versions WHERE project_id = ? ORDER BY version ASC`,
      [projectId]
    );

    return res.status(201).json({
      success: true,
      project: rows[0],
      versions: versionRows,
    });
  } catch (error) {
    console.error('[Create Project Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to create project.' });
  }
}

// Get all projects
export async function getProjects(req, res) {
  try {
    const db = getDb();

    if (db.isFallback) {
      const projectsList = Array.from(db.inMemoryDb.projects.values()).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      return res.status(200).json({ success: true, projects: projectsList });
    }

    const [rows] = await db.query(`SELECT id, name, original_image, framework, created_at, updated_at FROM projects ORDER BY created_at DESC`);
    return res.status(200).json({ success: true, projects: rows });
  } catch (error) {
    console.error('[Get Projects Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to retrieve projects.' });
  }
}

// Get single project details by ID with version history
export async function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();

    if (db.isFallback) {
      const project = db.inMemoryDb.projects.get(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found.' });
      }
      const versions = db.inMemoryDb.versions.get(id) || [];
      return res.status(200).json({ success: true, project, versions });
    }

    const [projectRows] = await db.query(`SELECT * FROM projects WHERE id = ?`, [id]);
    if (projectRows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const [versionRows] = await db.query(
      `SELECT * FROM project_versions WHERE project_id = ? ORDER BY version ASC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      project: projectRows[0],
      versions: versionRows,
    });
  } catch (error) {
    console.error('[Get Project By ID Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch project.' });
  }
}

// Update project code & add new version
export async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const { code, name } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required to save version.' });
    }

    const db = getDb();

    if (db.isFallback) {
      const project = db.inMemoryDb.projects.get(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      project.generated_code = code;
      if (name) project.name = name;
      project.updated_at = new Date().toISOString();

      const versions = db.inMemoryDb.versions.get(id) || [];
      const nextVersionNumber = versions.length + 1;
      const newVersionObj = {
        id: versions.length + 1,
        project_id: id,
        code,
        version: nextVersionNumber,
        created_at: new Date().toISOString(),
      };

      versions.push(newVersionObj);
      db.inMemoryDb.versions.set(id, versions);

      return res.status(200).json({
        success: true,
        project,
        versions,
      });
    }

    // MySQL update
    if (name) {
      await db.query(`UPDATE projects SET generated_code = ?, name = ? WHERE id = ?`, [code, name, id]);
    } else {
      await db.query(`UPDATE projects SET generated_code = ? WHERE id = ?`, [code, id]);
    }

    const [verCountRows] = await db.query(
      `SELECT COUNT(*) as count FROM project_versions WHERE project_id = ?`,
      [id]
    );
    const nextVersion = (verCountRows[0]?.count || 0) + 1;

    await db.query(
      `INSERT INTO project_versions (project_id, code, version) VALUES (?, ?, ?)`,
      [id, code, nextVersion]
    );

    const [updatedProj] = await db.query(`SELECT * FROM projects WHERE id = ?`, [id]);
    const [allVersions] = await db.query(
      `SELECT * FROM project_versions WHERE project_id = ? ORDER BY version ASC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      project: updatedProj[0],
      versions: allVersions,
    });
  } catch (error) {
    console.error('[Update Project Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to update project.' });
  }
}

// Delete project
export async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();

    if (db.isFallback) {
      db.inMemoryDb.projects.delete(id);
      db.inMemoryDb.versions.delete(id);
      return res.status(200).json({ success: true, message: 'Project deleted successfully.' });
    }

    await db.query(`DELETE FROM projects WHERE id = ?`, [id]);
    return res.status(200).json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    console.error('[Delete Project Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete project.' });
  }
}
