import React from 'react';
import { Linkedin, Github, Mail, Phone } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const formatDateRange = (startDate, endDate, currentlyWorking) => {
  const formattedStart = formatDate(startDate);
  if (!formattedStart) return '';
  
  if (currentlyWorking || !endDate) {
    return `Since ${formattedStart}`;
  }
  
  const formattedEnd = formatDate(endDate);
  return `${formattedStart}-${formattedEnd}`;
};

function SpecializedPreview({ data, id }) {
  return (
    <div id={id} className="p-6" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      {/* Header */}
     <div className="mb-2">
        <h1 className="text-[25px] font-bold text-blue-800 text-center">{data.personalInfo?.fullName}</h1>

        <div className="flex flex-col justify-center items-center">
          <p className='text-[13px]'>{`${data.personalInfo?.city}, ${data.personalInfo?.state} ${data.personalInfo?.pincode}`}</p>        
          <div className="flex flex-wrap justify-center gap-4 text-[12px]">

            {/* Phone */}
            {data.personalInfo?.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <a 
                  href={`tel:+91${data.personalInfo?.phone}`}
                  className=""
                >
                  +91 {data.personalInfo?.phone}
                </a>
              </span>
            )}


             {/* Email */}
            {data.personalInfo?.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <a 
                  href={`mailto:${data.personalInfo?.email}`}
                  className="hover:underline"
                >
                  {data.personalInfo?.email}
                </a>
              </span>
            )}

            {/* LinkedIn */}
            {data.personalInfo?.linkedIn && (
              <span className="flex items-center gap-1">
                <Linkedin className="h-3 w-3" />
                <a 
                  href={data.personalInfo?.linkedInLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {data.personalInfo?.linkedIn}
                </a>
              </span>
            )}
            
            {/* GitHub */}
            {data.personalInfo?.github && (
              <span className="flex items-center gap-1">
                <Github className="h-3 w-3" />
                <a 
                  href={data.personalInfo?.githubLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {data.personalInfo?.github}
                </a>
              </span>
            )}

          </div>
        </div>
      </div>

      {/* Summary */}
      {data.personalInfo?.summary && (
        <div className="mb-2">
          <h2 className="text-[17px] font-bold border-b border-gray-800 text-blue-500">Summary</h2>
          <p className="text-[13px]">{data.personalInfo.summary}</p>
        </div>
      )}

     {/* Trainings */}
      {data.trainings?.length > 0 && (
        <div className='mb-2'>
          <h2 className="text-[17px] font-bold border-b border-gray-800 text-blue-500">Trainings</h2>
          <div className='space-y-2 text-[13px]'>
            {data.trainings.map((training, index) => (
              <div key={index}>
                <div className="flex justify-between">
                  <h3 className="font-semibold text-blue-500">{`• ${training.name} by ${training.organization}`}</h3>
                  {training.startDate && (
                    <span className="text-gray-600">
                      {formatDateRange(training.startDate, training.endDate, training.currentlyWorking)}
                    </span>
                  )}
                </div>
                <ul>
                  {training.points.filter(p => p.trim()).map((point, i) => (
                    <div key={i} className='flex gap-2'>
                      <span>-</span>
                      <li className='list-none'>{point}</li>
                    </div>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects?.length > 0 && (
        <div className="mb-2">
          <h2 className="text-[17px] font-bold border-b border-gray-800 text-blue-500">Projects</h2>
          <div className="space-y-2 text-[13px]">
            {data.projects.map((project, index) => (
              <div key={index}>
                <div className="flex justify-between">
                  <h3 className="font-semibold text-blue-500">• {project.title}</h3>
                  {project.startDate && (
                    <span className="text-gray-600">
                      {formatDateRange(project.startDate, project.endDate, project.currentlyWorking)}
                    </span>
                  )}
                </div>
                <p className="italic mb-1">{project.summary}</p>
                <ul>
                  {project.points.filter(p => p.trim()).map((point, i) => (
                    <div key={i} className='flex gap-2'>
                      <span>-</span>
                      <li className='list-none'>{point}</li>
                    </div>
                  ))}
                </ul>
               {project.technologies?.length > 0 && (
                  <p className="flex gap-2 text-[13px]">
                    <span>-</span>
                    <span className="font-bold ">Technologies: </span>
                    {project.technologies.join(', ')}
                  </p>
                )}
                <div className='flex flex-col'>
                {project.githubLink && (
                 <div>
                  <span className=" ml-[13px] text-[13px">GitHub Repository Link: </span>
                  <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600">
                    {project.githubLink}
                  </a>
                 </div>
                )}
                 {project.liveLink && (
                 <div>
                  <span className=" ml-[13px] text-[13px">Live Project Link: </span>
                  <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600">
                    {project.liveLink}
                  </a>
                 </div>
                )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications?.length > 0 && (
        <div className="mb-1">
          <h2 className="text-[17px] font-bold border-b border-gray-800 text-blue-500">Certifications</h2>
          <div className="text-[13px]">
            {data.certifications.map((cert, index) => (
              <div key={index} className='flex justify-between'>
                <div>
                  <h3>• {cert.name} by {cert.issuer}</h3>
                  <p className='ml-2'>Link — <a href={cert.link} target="_blank" rel="noopener noreferrer">{cert.link}</a></p>
                </div>
                <p>
                  {cert.date && formatDate(cert.date)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

       {/* Skills */}
      {(data.skills.languages?.length > 0 || data.skills.frameworks?.length > 0 || 
        data.skills.toolsplatforms?.length > 0 || data.skills.softSkills?.length > 0) && (
        <div className="mb-2">
          <h2 className="text-[17px] font-bold border-b border-gray-800 text-blue-500">Techinal Skills</h2>
          <div className="text-[13px]">
            {data.skills.languages?.length > 0 && (
              <div className='flex gap-[50px]'>
                <h3 className="font-medium">• Languages: </h3>
                <p>{data.skills.languages.join(', ')}</p>
              </div>
            )}
            {data.skills.frameworks?.length > 0 && (
              <div className='flex gap-[40px]'>
                <h3 className="font-medium">• Frameworks: </h3>
                <p>{data.skills.frameworks.join(', ')}</p>
              </div>
            )}
            {data.skills.toolsplatforms?.length > 0 && (
              <div className='flex gap-[25px]'>
                <h3 className="font-medium">• Tools/Platforms:</h3>
                <p>{data.skills.toolsplatforms.join(', ')}</p>
              </div>
            )}
            {data.skills.softSkills?.length > 0 && (
              <div className='flex gap-[50px]'>
                <h3 className="font-medium">• Soft Skills:</h3>
                <p>{data.skills.softSkills.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <div className="">
          <h2 className="text-[17px] font-bold border-b border-gray-800 text-blue-500">Education</h2>
          <div className="space-y-1 text-[13px]">
            {data.education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between">
                  <h3 className="font-medium">• {edu.institution}</h3>
                  {(edu.city || edu.state) && (
                    <p>
                      {edu.state}{edu.state && edu.state ? ', ' : ''}{edu.country}
                    </p>
                  )}
                </div>
                <div className='flex justify-between'>
                  <p>
                    {edu.degree}{`${edu.degree?',':''} ${edu.fieldOfStudy} ${edu.fieldOfStudy?',':''}Grade: ${edu.marks}`}
                  </p>
                  {edu.startYear && (
                    <span className="text-gray-600">
                      {formatDateRange(
                        new Date(edu.startYear, 0, 1), 
                        edu.endYear ? new Date(edu.endYear, 0, 1) : null,
                        !edu.endYear
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SpecializedPreview;