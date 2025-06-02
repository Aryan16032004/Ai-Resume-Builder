import axios from 'axios'

export class ResumeService {
  async saveResumeData({ resumeId,resumeData }) {
    try {
      console.log('Saving resume data:', { resumeId, resumeData })
      
      const response = await axios.post(
        'http://localhost:8000/api/resume/save',
        {resumeId,resumeData,},
        {
          withCredentials: true
        }
      );

      return response
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Something went wrong while saving the resume.');
    }
  }
  
  async getResumeData(resumeId) {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/resume/${resumeId}`,
        {
          withCredentials: true
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching resume:', error);
      alert('Something went wrong while fetching the resume.');
    }
  }

  async createResume(name,templateName) {
    try {

      
      const response = await axios.post(
        'http://localhost:8000/api/resume/create',
        { name, templateName },
        {
          withCredentials: true
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error creating resume:', error);
      alert('Something went wrong while creating the resume.');
    }
  }

  async getAllResumes(){
     try {
        const response = await axios.get('http://localhost:8000/api/resume/', {
          withCredentials: true
        });
        return response.data.data;
      } catch (error) {
        console.error('Error fetching resumes:', error);
      }
  }

  async deleteResume(resumeId) {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/resume/${resumeId}`,
        {
          withCredentials: true
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Something went wrong while deleting the resume.');
    }
  }
}




const resumeService  = new ResumeService();
export default resumeService