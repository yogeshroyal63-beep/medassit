import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MedicalProfile = () => {

  const navigate = useNavigate();

  const [form,setForm] = useState({
    dob:"",
    gender:"",
    bloodGroup:"",
    height:"",
    weight:"",
    allergies:"",
    conditions:"",
    emergencyName:"",
    emergencyPhone:""
  });

  const handleChange = (e)=>{
    setForm({
      ...form,
      [e.target.name]:e.target.value
    });
  };

  const handleSubmit = (e)=>{
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <p className="text-3xl text-[var(--brand-700)]">MedAssist</p>
          <p className="mt-1 text-sm muted">Step 2 of 2 • Complete your medical profile</p>
        </div>
        <div className="glass-card rounded-3xl p-8">

        {/* Progress */}

        <div className="mb-5">
          <div className="h-2 w-full rounded-full bg-black/5">
            <div className="h-2 w-full rounded-full bg-[var(--brand-500)]"></div>
          </div>
        </div>

        <h2 className="text-2xl text-slate-900">Complete your medical profile</h2>
        <p className="mt-1 text-sm muted">Help us personalize your healthcare experience.</p>


        <form onSubmit={handleSubmit} className="space-y-5">


          {/* DOB + Gender */}

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="text-sm font-medium">
                Date of Birth *
              </label>

              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className="input-ui mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Gender *
              </label>

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="input-ui mt-1"
              >
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

          </div>


          {/* Blood + Height + Weight */}

          <div className="grid grid-cols-3 gap-4">

            <div>
              <label className="text-sm font-medium">
                Blood Group *
              </label>

              <select
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                className="input-ui mt-1"
              >
                <option>Select</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>O+</option>
                <option>O-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">
                Height (cm) *
              </label>

              <input
                name="height"
                value={form.height}
                onChange={handleChange}
                placeholder="170"
                className="input-ui mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Weight (kg) *
              </label>

              <input
                name="weight"
                value={form.weight}
                onChange={handleChange}
                placeholder="70"
                className="input-ui mt-1"
              />
            </div>

          </div>


          {/* Allergies */}

          <div>
            <label className="text-sm font-medium">
              Known Allergies
            </label>

            <textarea
              name="allergies"
              value={form.allergies}
              onChange={handleChange}
              placeholder="List any known allergies (e.g., penicillin, peanuts)"
              className="input-ui mt-1 min-h-24"
            />
          </div>


          {/* Conditions */}

          <div>
            <label className="text-sm font-medium">
              Existing Medical Conditions
            </label>

            <textarea
              name="conditions"
              value={form.conditions}
              onChange={handleChange}
              placeholder="List any existing conditions (e.g., diabetes, hypertension)"
              className="input-ui mt-1 min-h-24"
            />
          </div>


          <hr className="my-4 border-black/5" />


          {/* Emergency Contact */}

          <h3 className="font-semibold text-slate-900">
            Emergency Contact
          </h3>


          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="text-sm font-medium">
                Name *
              </label>

              <input
                name="emergencyName"
                value={form.emergencyName}
                onChange={handleChange}
                placeholder="Emergency contact name"
                className="input-ui mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Phone Number *
              </label>

              <input
                name="emergencyPhone"
                value={form.emergencyPhone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="input-ui mt-1"
              />
            </div>

          </div>


          {/* Buttons */}

          <div className="flex gap-4 pt-4">

            <button
              type="button"
              onClick={()=>navigate("/signup")}
              className="w-full rounded-xl border border-black/10 bg-white/40 py-3 font-semibold text-slate-800 transition hover:bg-white/60"
            >
              Back
            </button>

            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--brand-700)] py-3 font-semibold text-white transition hover:bg-[var(--brand-900)]"
            >
              Create Account
            </button>

          </div>

        </form>

        </div>
        <p className="mt-6 text-center text-xs muted">
          By creating an account, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>

  );

};

export default MedicalProfile;