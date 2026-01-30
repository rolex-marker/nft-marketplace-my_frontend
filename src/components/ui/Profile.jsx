import { useEffect, useState } from "react";
import axios from "axios";

import '../create/create.css';

const PINATA_API_KEY = 'ad6c656a7f0cc603a4ef';
const PINATA_SECRET_API_KEY = 'd6cd229b6cfa3e565146eeebc37bb3c14375176dd128e7f5c05ebdc830c637f8';

export default function Profile({formFir, reloadUserinfor }) {
  const [form, setForm] = useState(formFir);

  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
           maxBodyLength: Infinity,
            timeout: 120000, // ⬅️ 2 minutes
          headers: {
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY
          }
        }
      )

      const url = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
      console.log("IPFS URL:", url)
     setForm({ ...form, avatar: url })

    } catch (error) {
      console.log("ipfs image upload error:", error)
    }
  }


  const token = localStorage.getItem("token");
  console.log("token>>>", token);

  useEffect(() => {
    axios.get("http://localhost:4000/profile", {
      headers: { Authorization: `Bearer ${token}` },
       }).then(res => {
       if (res.data) {
        setForm(res.data);
        console.log(res.data)
      }})
  }, [token]);

  const saveProfile = async () => {
    await axios.put(
      "http://localhost:4000/profile",
      form,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    reloadUserinfor();
    alert("Profile updated 🎉");
  };

  

  return (
    <div className='create'>
      <div className="create-container">
        <h1>Make and Edit your Profile</h1>
        <p className='upload-file'>Upload Avatar File</p>
        <div className="upload-img-show">
            <h3>JPG, PNG, GIF, SVG, WEBM, MP3, MP4. Max 100mb.</h3>
            <img src={form.avatar} alt="banner" />
            <p>Drag and Drop File</p>
        </div>
        <form className='writeForm' autoComplete='off'>
          
          <div className="formGroup">
            <label>Upload Avatar</label>
            <input id="file" name="file" type="file" required onChange={uploadToIPFS} className='custom-file-input'
          />
          </div>
          <div className="formGroup">
            <label>UserName</label>
            <input placeholder="Username" value={form.username} id="name" name="name" type="text" onChange={e => setForm({ ...form, username: e.target.value })}   />
          </div>
          <div className="formGroup">
            <label>Bio</label>
            <textarea id="description" name="descripton" type="text" onChange={e => setForm({ ...form, bio: e.target.value })} rows={4}
         placeholder="Bio" value={form.bio}
          ></textarea>
          </div>
        
              <button
              type="button"
              onClick={saveProfile}
              className='writeButton'
            >
            SAVE
            </button>
        </form>
      </div>
    </div>
  );
}
