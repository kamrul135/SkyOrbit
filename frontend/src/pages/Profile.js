import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Camera, Lock, Settings, CheckCircle, FileText } from 'lucide-react';
import './Profile.css';

/* ── date কে "YYYY-MM-DD" format এ নিয়ে আসে ── */
const toDateInput = (val) => {
  if (!val) return '';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0]; // "2000-01-15"
  } catch {
    return '';
  }
};

const Profile = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
    seat_preference: 'Any',
    meal_preference: 'Any',
    profile_picture: '',
    first_name: '',
    last_name: '',
    dob: '',
    gender: '',
    phone: '',
    passport_number: '',
    passport_expiry: '',
    nationality: '',
  });

  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]                 = useState(true);
  const [saving, setSaving]                   = useState(false);
  const [message, setMessage]                 = useState({ type: '', text: '' });
  /* track করে রাখি যাতে শুধু changed fields save হয় */
  const [originalProfile, setOriginalProfile] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    } else {
      window.location.href = '/login';
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/profile/${user.id}`);
      const data = res.data;

      /* ✅ date fields কে সঠিক format এ convert করি */
      const normalized = {
        ...data,
        dob:             toDateInput(data.dob),
        passport_expiry: toDateInput(data.passport_expiry),
      };

      setProfile(prev => ({ ...prev, ...normalized }));
      setOriginalProfile({ ...normalized }); // original copy রাখি
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Could not load profile data' });
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, profile_picture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const set = (field) => (e) =>
    setProfile(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        seat_preference:  profile.seat_preference,
        meal_preference:  profile.meal_preference,
        profile_picture:  profile.profile_picture,
        first_name:       profile.first_name,
        last_name:        profile.last_name,
        dob:              profile.dob,
        gender:           profile.gender,
        phone:            profile.phone,
        passport_number:  profile.passport_number,
        passport_expiry:  profile.passport_expiry,
        nationality:      profile.nationality,
      };

      if (password) payload.password = password;

      await axios.put(`http://127.0.0.1:5000/profile/${user.id}`, payload);

      /* localStorage update */
      localStorage.setItem('user', JSON.stringify({ ...user, ...profile }));
      setOriginalProfile({ ...profile });

      setMessage({ type: 'success', text: 'Profile updated successfully! Your info will auto-fill during booking.' });
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
    setSaving(false);
  };

  /* ── কোনো change হয়েছে কিনা detect করি ── */
  const hasChanges = () => {
    if (!originalProfile) return false;
    if (password) return true;
    return Object.keys(originalProfile).some(
      key => (profile[key] || '') !== (originalProfile[key] || '')
    );
  };

  if (loading) return <div className="profile-loading">Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>

      {message.text && (
        <div className={`profile-message ${message.type}`}>
          {message.type === 'success' && <CheckCircle size={20} />}
          {message.text}
        </div>
      )}

      <form className="profile-content" onSubmit={handleSubmit}>

        {/* Left Column: Avatar & Basic Info */}
        <div className="profile-sidebar">
          <div className="avatar-section">
            <div className="avatar-preview">
              {profile.profile_picture
                ? <img src={profile.profile_picture} alt="Profile" />
                : <User size={60} color="#ccc" />}
              <label htmlFor="avatar-upload" className="upload-btn">
                <Camera size={16} />
              </label>
              <input id="avatar-upload" type="file" accept="image/*"
                onChange={handleImageUpload} style={{ display: 'none' }} />
            </div>
            <h3>{profile.username}</h3>
            <p>{profile.email}</p>
            <span className="role-badge">{profile.role}</span>
          </div>
        </div>

        {/* Right Column */}
        <div className="profile-settings">

          {/* Traveler Info */}
          <div className="settings-section">
            <h3 className="section-title">
              <FileText size={20} /> Traveler Information
              <span style={{ fontSize: '12px', color: '#4cd964', fontWeight: 'normal', marginLeft: '10px' }}>
                ✓ Auto-fills during booking
              </span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>First Name (as in passport)</label>
                <input type="text" placeholder="First Name"
                  value={profile.first_name || ''} onChange={set('first_name')} />
              </div>
              <div className="form-group">
                <label>Last Name (as in passport)</label>
                <input type="text" placeholder="Last Name"
                  value={profile.last_name || ''} onChange={set('last_name')} />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                {/* ✅ value সবসময় "YYYY-MM-DD" format এ */}
                <input type="date"
                  value={profile.dob || ''}
                  onChange={set('dob')} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select value={profile.gender || ''} onChange={set('gender')}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" placeholder="+880 1XX XXXXXXX"
                  value={profile.phone || ''} onChange={set('phone')} />
              </div>
              <div className="form-group">
                <label>Nationality</label>
                <input type="text" placeholder="e.g. Bangladeshi"
                  value={profile.nationality || ''} onChange={set('nationality')} />
              </div>
              <div className="form-group">
                <label>Passport Number</label>
                <input type="text" placeholder="e.g. W3903920"
                  value={profile.passport_number || ''} onChange={set('passport_number')} />
              </div>
              <div className="form-group">
                <label>Passport Expiry Date</label>
                {/* ✅ value সবসময় "YYYY-MM-DD" format এ */}
                <input type="date"
                  value={profile.passport_expiry || ''}
                  onChange={set('passport_expiry')} />
              </div>
            </div>
          </div>

          {/* Flight Preferences */}
          <div className="settings-section">
            <h3 className="section-title"><Settings size={20} /> Flight Preferences</h3>
            <div className="form-group">
              <label>Seat Preference</label>
              <select value={profile.seat_preference || 'Any'} onChange={set('seat_preference')}>
                <option value="Any">Any Seat</option>
                <option value="Window">Window</option>
                <option value="Aisle">Aisle</option>
                <option value="Middle">Middle</option>
              </select>
            </div>
            <div className="form-group">
              <label>Meal Preference</label>
              <select value={profile.meal_preference || 'Any'} onChange={set('meal_preference')}>
                <option value="Any">Standard / No Preference</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Halal">Halal</option>
                <option value="Kosher">Kosher</option>
                <option value="Gluten-Free">Gluten-Free</option>
              </select>
            </div>
          </div>

          {/* Security */}
          <div className="settings-section">
            <h3 className="section-title"><Lock size={20} /> Security</h3>
            <div className="form-group">
              <label>New Password (leave blank to keep current)</label>
              <input type="password" placeholder="Enter new password"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {password && (
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" placeholder="Confirm new password"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            )}
          </div>

          <div className="form-actions">
            {/* ✅ কোনো change না হলে button disabled */}
            <button type="submit" disabled={saving || !hasChanges()} className="save-btn"
              style={{ opacity: (!hasChanges() && !saving) ? 0.5 : 1, cursor: (!hasChanges() && !saving) ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving...' : hasChanges() ? 'Save Changes' : 'No Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;