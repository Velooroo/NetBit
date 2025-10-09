struct ProjectElement {
    id: u32,
    name: String,
    description: String,
    typeId: u32,
    order: u32,    
}

struct Project {
    id: u32,
    name: String,
    description: String,
    elements: Vec<ProjectElement>,

}

struct ProjectManager {
    nextId: u32,
    projects: Vec<Project>,
}

