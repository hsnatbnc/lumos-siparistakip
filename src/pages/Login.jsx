import { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 const backendURL = "https://lumosapi.com/lumos-pos/api-yonetim/";

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e, type) => {
  e.preventDefault();

  if (!form.username || !form.password) {
    toast.error("Kullanıcı adı ve şifre zorunludur");
    return;
  }

  setLoading(true);

  try {
    const response = await axios.post(
      backendURL + "login_shop.php",
      form,
      { withCredentials: true }
    );

    if (response.data.success) {
      localStorage.setItem("shop", JSON.stringify(response.data.shop));
      localStorage.setItem("branch_token_yonetim", "true");

      if (response.data.token) {
        sessionStorage.setItem("branch_token", response.data.token);
      }

      if (type === "takip") {
        navigate("/siparis-takip");
      } else {
        navigate("/siparis-takip-yonetimi");
      }

    } else {
      toast.error(response.data.message || "Giriş başarısız", {
        autoClose: 1500,
      });
    }

  } catch (error) {
    toast.error(error.response?.data?.message || "Sunucu hatası", {
      autoClose: 1500,
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl flex overflow-hidden">
        {/* Left Side - Logo */}
        <div className="hidden md:flex w-1/2 items-center justify-center p-8">
          <img
            src="/lumos.png"
            alt="Lumos Logo"
            className="max-w-[80%] max-h-[80%] object-contain"
          />
        </div>
        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Lumos Sales Sipariş Takip
          </h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Kullanıcı adınızı girin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Şifrenizi girin"
              />
            </div>
          <div className="flex gap-3">
  <button
    type="button"
    onClick={(e) => handleLogin(e, "takip")}
    disabled={loading}
    className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all"
  >
    Takip Ekranı
  </button>

  <button
    type="button"
    onClick={(e) => handleLogin(e, "yonetim")}
    disabled={loading}
    className="w-1/2 bg-gray-800 hover:bg-black text-white font-semibold py-3 rounded-lg transition-all"
  >
    Yönetim Ekranı
  </button>
</div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
