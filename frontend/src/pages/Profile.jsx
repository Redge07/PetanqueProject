import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import { UsersContext } from "../App";
import { linkBackend } from "../constants/LinkBackend";
import { getFormatLabel } from "../utils/formatLabels";
import NotConnect from "../constants/NotConnect";
import ConfirmModal from "../components/ui/ConfirmModal";
import {
  User,
  Mail,
  Lock,
  Trash2,
  Trophy,
  ChevronLeft,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

const Profile = () => {
  const { player, setPlayer } = useContext(UsersContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [pwdForm, setPwdForm] = useState({ old: "", new: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const { setLoad, setError } = useContext(UsersContext);

  useEffect(() => {
    if (!player) return;
    const load = async () => {
      setLoad(true);
      try {
        const res = await axios.get(linkBackend + "log/profile/" + player.id);
        setProfile(res.data);
      } catch {
        setError(true);
      } finally {
        setLoad(false);
      }
    };
    load();
  }, [player]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.new !== pwdForm.confirm) {
      setPwdMsg("Les mots de passe ne correspondent pas");
      return;
    }
    if (pwdForm.new.length < 6) {
      setPwdMsg("Le mot de passe doit faire au moins 6 caractères");
      return;
    }
    setLoad(true);
    try {
      const res = await axios.put(linkBackend + "log/password/" + player.id, {
        oldPassword: pwdForm.old,
        newPassword: pwdForm.new,
      });
      setPwdMsg(res.data.message);
      if (res.data.res === 1) setPwdForm({ old: "", new: "", confirm: "" });
    } catch {
      setError(true);
    } finally {
      setLoad(false);
    }
  };

  const handleDeleteAccount = async () => {
    setConfirmDeleteAccount(false);
    setLoad(true);
    try {
      await axios.delete(linkBackend + "log/account/" + player.id);
      localStorage.removeItem("token");
      setPlayer(null);
      navigate("/Login");
    } catch {
      setError(true);
    } finally {
      setLoad(false);
    }
  };

  if (!player) return <NotConnect />;

  const startStatuses = { 0: { label: "Pas commencé", color: "bg-orange-100 text-orange-500" }, 1: { label: "En cours", color: "bg-green-100 text-green-600" }, 2: { label: "Terminé", color: "bg-gray-100 text-gray-500" } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-mid)] to-[var(--color-bg-dark)]">
      {confirmDeleteAccount && (
        <ConfirmModal
          message="Supprimer votre compte définitivement ? Toutes vos données seront effacées (concours, historique). Cette action est irréversible."
          onConfirm={handleDeleteAccount}
          onCancel={() => setConfirmDeleteAccount(false)}
        />
      )}
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-[var(--color-gold)]" />
            </div>
            <h1 className="text-2xl font-light text-[var(--color-primary)]">
              Mon <span className="font-semibold">profil</span>
            </h1>
          </div>
          <NavLink
            to="/"
            className="flex items-center gap-2 text-[var(--color-gray)] hover:text-[var(--color-primary)] hover:bg-white/50 px-4 py-2 rounded-xl transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour
          </NavLink>
        </div>

        {/* Infos compte */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl mb-6">
          <h2 className="font-semibold text-[var(--color-primary)] mb-4">
            Informations du compte
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-mid)] rounded-xl">
              <User className="w-4 h-4 text-[var(--color-gray)]" />
              <div>
                <p className="text-xs text-[var(--color-gray)]">Pseudo</p>
                <p className="font-medium text-[var(--color-primary)]">
                  {player.pseudo}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-mid)] rounded-xl">
              <Mail className="w-4 h-4 text-[var(--color-gray)]" />
              <div>
                <p className="text-xs text-[var(--color-gray)]">Email</p>
                <p className="font-medium text-[var(--color-primary)]">
                  {player.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Changer mot de passe */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="font-semibold text-[var(--color-primary)]">
              Changer le mot de passe
            </h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Ancien mot de passe"
                value={pwdForm.old}
                onChange={(e) => setPwdForm({ ...pwdForm, old: e.target.value })}
                required
                className="w-full h-11 px-4 pr-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-gray-light)]"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input
              type={showPwd ? "text" : "password"}
              placeholder="Nouveau mot de passe (min. 6 caractères)"
              value={pwdForm.new}
              onChange={(e) => setPwdForm({ ...pwdForm, new: e.target.value })}
              required
              className="w-full h-11 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
            <input
              type={showPwd ? "text" : "password"}
              placeholder="Confirmer le nouveau mot de passe"
              value={pwdForm.confirm}
              onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
              required
              className="w-full h-11 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
            {pwdMsg && (
              <p className={`text-sm rounded-xl p-3 ${pwdMsg.includes("jour") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                {pwdMsg}
              </p>
            )}
            <button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl font-medium hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mettre à jour
            </button>
          </form>
        </div>

        {/* Mes concours organisés */}
        {profile?.organized?.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-5 h-5 text-[var(--color-gold)]" />
              <h2 className="font-semibold text-[var(--color-primary)]">
                Mes concours organisés
              </h2>
            </div>
            <ul className="space-y-2">
              {profile.organized.map((t) => (
                <li key={t.id} className="flex items-center justify-between p-3 bg-[var(--color-bg-mid)] rounded-xl">
                  <div>
                    <p className="font-medium text-[var(--color-primary)] text-sm">{t.name}</p>
                    <p className="text-xs text-[var(--color-gray)]">{getFormatLabel(t.style)} • #{t.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${startStatuses[t.start]?.color}`}>
                      {startStatuses[t.start]?.label}
                    </span>
                    <NavLink
                      to={"/" + t.id}
                      className="text-xs text-[var(--color-primary)] hover:underline"
                    >
                      Voir
                    </NavLink>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Concours en cours (participant) */}
        {profile?.currentPlayer && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Eye className="w-5 h-5 text-[var(--color-primary)]" />
              <h2 className="font-semibold text-[var(--color-primary)]">
                Concours en cours
              </h2>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--color-bg-mid)] rounded-xl">
              <div>
                <p className="font-medium text-[var(--color-primary)] text-sm">{profile.currentPlayer.name}</p>
                <p className="text-xs text-[var(--color-gray)]">{getFormatLabel(profile.currentPlayer.style)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Supprimer le compte */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-red-100">
          <div className="flex items-center gap-3 mb-3">
            <Trash2 className="w-5 h-5 text-red-500" />
            <h2 className="font-semibold text-[var(--color-primary)]">
              Supprimer mon compte
            </h2>
          </div>
          <p className="text-sm text-[var(--color-gray)] mb-4">
            Cette action est irréversible. Toutes vos données personnelles
            seront supprimées conformément au RGPD.
          </p>
          <button
            onClick={() => setConfirmDeleteAccount(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-all duration-300 text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
