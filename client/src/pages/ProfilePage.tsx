import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User as UserIcon, Mail, Camera, FileText, GraduationCap, GitBranch, Calendar, Briefcase, Building } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

interface ProfileFormInputs {
  name: string;
  email: string;
  college: string;
  branch: string;
  graduationYear: string;
  targetRole: string;
  targetCompany: string;
}

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.profilePicture || null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormInputs>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      college: user?.college || '',
      branch: user?.branch || '',
      graduationYear: user?.graduationYear || '',
      targetRole: user?.targetRole || '',
      targetCompany: user?.targetCompany || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        college: user.college || '',
        branch: user.branch || '',
        graduationYear: user.graduationYear || '',
        targetRole: user.targetRole || '',
        targetCompany: user.targetCompany || '',
      });
      setAvatarPreview(user.profilePicture || null);
    }
  }, [user, reset]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProfileFormInputs) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name.trim());
      formData.append('college', data.college ? data.college.trim() : '');
      formData.append('branch', data.branch ? data.branch.trim() : '');
      formData.append('graduationYear', data.graduationYear ? data.graduationYear.trim() : '');
      formData.append('targetRole', data.targetRole ? data.targetRole.trim() : '');
      formData.append('targetCompany', data.targetCompany ? data.targetCompany.trim() : '');

      if (avatarFile) {
        formData.append('profilePicture', avatarFile);
      }

      const updatedUser = await authService.updateProfile(formData);
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <h1 className="text-2xl font-bold text-white">My Profile Settings</h1>
        <p className="text-xs text-gray-400 mt-1">Manage your account information, target career, and avatar picture.</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-xl border-2 border-indigo-500/40">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || <UserIcon className="w-10 h-10" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full cursor-pointer shadow-lg transition">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-3">Click the camera icon to upload a new profile picture</p>
          </div>

          <Input
            label="Full Name"
            leftIcon={<UserIcon className="w-4 h-4" />}
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />

          <Input
            label="Email Address"
            disabled
            value={user?.email || ''}
            leftIcon={<Mail className="w-4 h-4" />}
            helperText="Email address cannot be changed."
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Target Role"
              placeholder="e.g. MERN Stack Developer"
              leftIcon={<Briefcase className="w-4 h-4" />}
              error={errors.targetRole?.message}
              helperText="Used for personalized DSA & Placement recommendations"
              {...register('targetRole')}
            />

            <Input
              label="Target Company (Optional)"
              placeholder="e.g. Amazon"
              leftIcon={<Building className="w-4 h-4" />}
              error={errors.targetCompany?.message}
              helperText="Filter company-focused interview problems"
              {...register('targetCompany')}
            />
          </div>

          <Input
            label="College"
            placeholder="e.g. Stanford University"
            leftIcon={<GraduationCap className="w-4 h-4" />}
            error={errors.college?.message}
            {...register('college')}
          />

          <Input
            label="Branch"
            placeholder="e.g. Computer Science"
            leftIcon={<GitBranch className="w-4 h-4" />}
            error={errors.branch?.message}
            {...register('branch')}
          />

          <Input
            label="Graduation Year"
            placeholder="e.g. 2026"
            leftIcon={<Calendar className="w-4 h-4" />}
            error={errors.graduationYear?.message}
            {...register('graduationYear', {
              validate: (value) => {
                if (!value || value.trim() === '') return true;
                const isFourDigits = /^\d{4}$/.test(value.trim());
                if (!isFourDigits) {
                  return 'Graduation year must be a 4-digit year (e.g. 2026)';
                }
                return true;
              },
            })}
          />

          {/* Current Resume Status */}
          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-xs font-semibold text-white">Uploaded PDF Resume</p>
                <p className="text-[10px] text-gray-400">
                  {user?.resume ? 'Resume uploaded & ready for AI auditing' : 'No resume uploaded yet'}
                </p>
              </div>
            </div>
            {user?.resume && (
              <a
                href={user.resume}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                View PDF
              </a>
            )}
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
};
