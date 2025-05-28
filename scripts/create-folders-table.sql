-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID,
  path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_path ON folders(path);

-- Insert some default folders if they don't exist
INSERT INTO folders (name, description, parent_id, path) 
SELECT 'HR Policies', 'Human Resources policies and procedures', NULL, '/HR Policies'
WHERE NOT EXISTS (SELECT 1 FROM folders WHERE name = 'HR Policies' AND parent_id IS NULL);

INSERT INTO folders (name, description, parent_id, path) 
SELECT 'Contracts', 'Employee contracts and agreements', NULL, '/Contracts'
WHERE NOT EXISTS (SELECT 1 FROM folders WHERE name = 'Contracts' AND parent_id IS NULL);

INSERT INTO folders (name, description, parent_id, path) 
SELECT 'Training Materials', 'Training documents and resources', NULL, '/Training Materials'
WHERE NOT EXISTS (SELECT 1 FROM folders WHERE name = 'Training Materials' AND parent_id IS NULL);
