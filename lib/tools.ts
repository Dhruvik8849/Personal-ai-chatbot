import { PROFILE } from "./profile";

export async function runTool(toolName: string, input: string): Promise<string> {
  const tools: Record<string, () => string> = {
    
    //  BASIC INFO
    bio: () => PROFILE.bio,

    contact: () =>
      `You can contact Dhruvik at:
Email: ${PROFILE.contact.email}
GitHub: ${PROFILE.contact.github}
LinkedIn: ${PROFILE.contact.linkedin}`,

    education: () =>
      `Dhruvik is studying ${PROFILE.education.branch} at ${PROFILE.education.college}.`,

    //  SKILLS
    skills: () =>
      `Dhruvik's skills include: ${PROFILE.skills.join(", ")}.`,

    //  PROJECTS
    projects: () =>
      `You can explore Dhruvik's projects here:
${PROFILE.projects.github}`,

    //  ACHIEVEMENTS
    achievements: () =>
      PROFILE.achievements.length
        ? `Achievements:
- ${PROFILE.achievements.join("\n- ")}`
        : "No achievements added yet.",

    //  PORTFOLIO
    portfolio: () =>
      `Portfolio:
${PROFILE.portfolio}`,

    //  INTERESTS
    interests: () =>
      `Dhruvik is interested in: ${PROFILE.interests.join(", ")}.`,

    //  AVAILABILITY
    availability: () =>
      `Dhruvik is ${PROFILE.availability}.`,

    //  SPORTS
    sports: () =>
      `Dhruvik is involved in: ${PROFILE.sports.join(", ")}.`,
  };

  //  SAFE CHECK
  const tool = tools[toolName];

  if (!tool) {
    return "Sorry, I don't have that information.";
  }

  //  EXECUTE
  return tool();
}