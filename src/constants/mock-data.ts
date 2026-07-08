import { Subject, Department } from "../types";

export const MOCK_SUBJECTS: Subject[] = [
    {
        id: 1,
        code: "CS-101",
        name: "Introduction to Computing",
        department: { id: 1, name: "CS", code: "CS", description: "" } as Department,
        description: "An introductory course covering the foundational principles of computer science, basic programming logic, algorithmic thinking, and fundamental computer architectures.",
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        code: "MATH-203",
        name: "Linear Algebra",
        department: { id: 2, name: "Math", code: "MATH", description: "" } as Department,
        description: "A detailed study of systems of linear equations, matrices, determinants, vector spaces, eigenvalues, eigenvectors, and linear transformations essential for data engines.",
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        code: "ENG-112",
        name: "Technical and Business Writing",
        department: { id: 3, name: "English", code: "ENG", description: "" } as Department,
        description: "Focuses on developing advanced professional communication skills, drafting technical project requirements, formatting executive documentation, and engineering clear project proposals.",
        createdAt: new Date().toISOString()
    }
];