import React, { useEffect, useState } from 'react';
import { User, Mail, Briefcase, MapPin, Phone, Globe, Edit2, Save, X } from 'lucide-react';
import api from '../api/client';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'freelancer';
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  company?: string;
  skills?: string[];
  hourly_rate?: number;
  profile_image?: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    location: '',
    website: '',
    company: '',
    skills: '',
    hourly_rate: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/users/profile/');
      const userData = response.data;
      setProfile(userData);
      setFormData({
        name: userData.name || '',
        bio: userData.bio || '',
        phone: userData.phone || '',
        location: userData.location || '',
        website: userData.website || '',
        company: userData.company || '',
        skills: Array.isArray(userData.skills) ? userData.skills.join(', ') : '',
        hourly_rate: userData.hourly_rate || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const updateData: any = {
        name: formData.name,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        website: formData.website,
      };

      if (profile?.role === 'client') {
        updateData.company = formData.company;
      }

      if (profile?.role === 'freelancer') {
        updateData.skills = formData.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
        if (formData.hourly_rate) {
          updateData.hourly_rate = parseFloat(formData.hourly_rate);
        }
      }

      const response = await api.put('/users/profile/', updateData);
      setProfile(response.data);
      setSuccess('Profile updated successfully!');
      setEditMode(false);

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        location: profile.location || '',
        website: profile.website || '',
        company: profile.company || '',
        skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
        hourly_rate: profile.hourly_rate?.toString() || '',
      });
    }
    setEditMode(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load profile</p>
          <button
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
              >
                <X size={18} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-16 mb-6">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  <User size={48} />
                </div>
              </div>
              <div className="ml-4 mb-2">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  profile.role === 'client' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {profile.role === 'client' ? 'Client' : 'Freelancer'}
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900">
                    <User size={18} className="text-gray-400" />
                    <span className="text-lg font-semibold">{profile.name}</span>
                  </div>
                )}
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={18} className="text-gray-400" />
                  <span>{profile.email}</span>
                  <span className="text-xs text-gray-400 ml-2">(cannot be changed)</span>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                {editMode ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-600">
                    {profile.bio || 'No bio added yet.'}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={18} className="text-gray-400" />
                    <span>{profile.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, Country"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={18} className="text-gray-400" />
                    <span>{profile.location || 'Not provided'}</span>
                  </div>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                {editMode ? (
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe size={18} className="text-gray-400" />
                    {profile.website ? (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profile.website}
                      </a>
                    ) : (
                      <span>Not provided</span>
                    )}
                  </div>
                )}
              </div>

              {/* Client-specific: Company */}
              {profile.role === 'client' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your company name"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase size={18} className="text-gray-400" />
                      <span>{profile.company || 'Not provided'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Freelancer-specific: Skills */}
              {profile.role === 'freelancer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills (comma-separated)
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="React, Node.js, Python, etc."
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills && profile.skills.length > 0 ? (
                          profile.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-600">No skills added yet</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate ($)
                    </label>
                    {editMode ? (
                      <input
                        type="number"
                        name="hourly_rate"
                        value={formData.hourly_rate}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="50.00"
                      />
                    ) : (
                      <div className="text-gray-600">
                        {profile.hourly_rate ? `$${profile.hourly_rate}/hr` : 'Not set'}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
