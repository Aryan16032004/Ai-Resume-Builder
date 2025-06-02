import React from 'react';

function PersonalInfoForm({ data = {}, updateData ,templateName}) {
  const safeData = {
    fullName: '',
    pincode: '',
    state:'',
    city: '',
    email: '',
    phone: '',
    linkedIn: '',
    linkedInLink: '',
    github: '',
    githubLink: '',
    summary: '',
    ...data
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData({
      ...safeData,
      [name]: value
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Personal Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name*</label>
          <input
            type="text"
            name="fullName"
            value={safeData.fullName}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

       {templateName === 'SpecializedPreview' && (
         <>
           <div>
            <label className="block text-sm font-medium text-gray-700">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={safeData.pincode}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                name="state"
                value={safeData.state}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                name="city"
                value={safeData.city}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
         </>
       )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Email*</label>
          <input
            type="email"
            name="email"
            value={safeData.email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            name="phone"
            value={safeData.phone}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Linkedin</label>
          <input
            type="text"
            name="linkedIn"
            value={safeData.linkedIn}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder='Text here will be shown on the resume'
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">LinkedIn Link</label>
          <input
            type="url"
            name="linkedInLink"
            value={safeData.linkedInLink}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">GitHub</label>
          <input
            type="text"
            name="github"
            value={safeData.github}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder='Text here will be shown on the resume'
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">GitHub Link</label>
          <input
            type="url"
            name="githubLink"
            value={safeData.githubLink}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://github.com/yourusername"
          />
        </div>
       
        <div>
          <label className="block text-sm font-medium text-gray-700">Professional Summary</label>
          <textarea
            name="summary"
            value={safeData.summary}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Briefly describe your professional background and skills"
          />
        </div>
      </div>
    </div>
  );
}

export default PersonalInfoForm;