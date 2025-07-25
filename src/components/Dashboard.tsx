import React, { useState, useEffect } from 'react';
import { Save, Upload, Edit3, Image, FileText, Trash2, Plus, Link, FileUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { postsAPI, activitiesAPI, imagesAPI } from '../services/api';

interface DashboardProps {
  onDataUpdate: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onDataUpdate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'content' | 'images' | 'activities'>('content');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [posts, setPosts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data from API
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'content') {
        const postsData = await postsAPI.getAll(user?.id);
        setPosts(postsData);
      } else if (activeTab === 'activities') {
        const activitiesData = await activitiesAPI.getAll(user?.id);
        setActivities(activitiesData);
      } else if (activeTab === 'images') {
        const imagesData = await imagesAPI.getAll();
        setImages(imagesData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('png')) {
      alert('Solo se permiten archivos PNG');
      return;
    }

    // Create image to check dimensions
    const img = new Image();
    img.onload = async () => {
      if (img.width !== 512 || img.height !== 512) {
        alert('La imagen debe ser de 512x512 píxeles');
        return;
      }

      try {
        setLoading(true);
        await imagesAPI.upload(file);
        await loadData();
        onDataUpdate();
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Error al subir la imagen');
      } finally {
        setLoading(false);
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const startEditing = (id: string, data: any) => {
    setIsEditing(id);
    setEditData({ ...data });
  };

  const saveEdit = async () => {
    if (!isEditing) return;

    try {
      setLoading(true);
      
      if (activeTab === 'content') {
        if (editData._id) {
          await postsAPI.update(editData._id, editData);
        } else {
          await postsAPI.create(editData);
        }
      } else if (activeTab === 'activities') {
        if (editData._id) {
          await activitiesAPI.update(editData._id, editData);
        } else {
          await activitiesAPI.create(editData);
        }
      }

      await loadData();
      onDataUpdate();
      setIsEditing(null);
      setEditData({});
    } catch (error) {
      console.error('Save failed:', error);
      alert('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este elemento?')) return;

    try {
      setLoading(true);
      
      if (activeTab === 'content') {
        await postsAPI.delete(id);
      } else if (activeTab === 'activities') {
        await activitiesAPI.delete(id);
      } else if (activeTab === 'images') {
        await imagesAPI.delete(id);
      }

      await loadData();
      onDataUpdate();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  const addNew = () => {
    const newId = 'new-' + Date.now().toString();
    if (activeTab === 'content') {
      startEditing(newId, {
        title: 'Nuevo Post',
        content: 'Contenido del nuevo post...',
        date: new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        image: ''
      });
    } else if (activeTab === 'activities') {
      startEditing(newId, {
        title: 'Nueva Actividad',
        description: 'Descripción de la nueva actividad...',
        character: '/12.png',
        links: [],
        documents: []
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Restringido</h2>
          <p className="text-gray-600">Debes iniciar sesión para acceder al dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Dashboard</h1>
          <p className="text-lg text-gray-600">Gestiona el contenido de tu blog</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-4 border-b-2 border-black">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-6 py-3 font-medium border-2 border-black rounded-t-lg transition-colors ${
                activeTab === 'content'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-teal-50'
              }`}
            >
              <FileText className="inline mr-2" size={20} />
              Contenido
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-6 py-3 font-medium border-2 border-black rounded-t-lg transition-colors ${
                activeTab === 'images'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-teal-50'
              }`}
            >
              <Image className="inline mr-2" size={20} />
              Imágenes
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-6 py-3 font-medium border-2 border-black rounded-t-lg transition-colors ${
                activeTab === 'activities'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-teal-50'
              }`}
            >
              <Edit3 className="inline mr-2" size={20} />
              Actividades
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && !loading && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Posts del Blog</h2>
              <button
                onClick={addNew}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg border-2 border-black hover:bg-teal-600 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Nuevo Post
              </button>
            </div>

            {posts.length === 0 && !isEditing && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-black">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay posts aún</h3>
                <p className="text-gray-500 mb-4">Crea tu primer post para comenzar</p>
                <button
                  onClick={addNew}
                  className="bg-teal-500 text-white px-6 py-2 rounded-lg border-2 border-black hover:bg-teal-600 transition-colors"
                >
                  Crear Primer Post
                </button>
              </div>
            )}

            <div className="grid gap-6">
              {posts.map((post: any) => (
                <div key={post._id} className="bg-white p-6 rounded-lg border-4 border-black shadow-lg">
                  {isEditing === post._id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editData.title || ''}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="w-full p-3 border-2 border-black rounded-lg font-bold text-xl"
                        placeholder="Título del post"
                      />
                      <textarea
                        value={editData.content || ''}
                        onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                        className="w-full p-3 border-2 border-black rounded-lg h-32"
                        placeholder="Contenido del post"
                      />
                      <input
                        type="text"
                        value={editData.date || ''}
                        onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                        className="w-full p-3 border-2 border-black rounded-lg"
                        placeholder="Fecha"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg border-2 border-black hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                          <Save size={16} />
                          Guardar
                        </button>
                        <button
                          onClick={() => setIsEditing(null)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg border-2 border-black hover:bg-gray-600 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{post.title}</h3>
                          <p className="text-sm text-gray-600">{post.date}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(post._id, post)}
                            className="bg-blue-500 text-white p-2 rounded-lg border-2 border-black hover:bg-blue-600 transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => deleteItem(post._id)}
                            className="bg-red-500 text-white p-2 rounded-lg border-2 border-black hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700">{post.content}</p>
                    </div>
                  )}
                </div>
              ))}

              {/* New post form */}
              {isEditing && !posts.find(p => p._id === isEditing) && (
                <div className="bg-white p-6 rounded-lg border-4 border-black shadow-lg">
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editData.title || ''}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="w-full p-3 border-2 border-black rounded-lg font-bold text-xl"
                      placeholder="Título del post"
                    />
                    <textarea
                      value={editData.content || ''}
                      onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                      className="w-full p-3 border-2 border-black rounded-lg h-32"
                      placeholder="Contenido del post"
                    />
                    <input
                      type="text"
                      value={editData.date || ''}
                      onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                      className="w-full p-3 border-2 border-black rounded-lg"
                      placeholder="Fecha"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg border-2 border-black hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <Save size={16} />
                        Guardar
                      </button>
                      <button
                        onClick={() => setIsEditing(null)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg border-2 border-black hover:bg-gray-600 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && !loading && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Imágenes de Personajes</h2>
              <div>
                <input
                  type="file"
                  accept=".png"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="character-upload"
                />
                <label
                  htmlFor="character-upload"
                  className="bg-teal-500 text-white px-4 py-2 rounded-lg border-2 border-black hover:bg-teal-600 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Upload size={20} />
                  Subir Imagen (512x512 PNG)
                </label>
              </div>
            </div>

            {images.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-black">
                <Image size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay imágenes aún</h3>
                <p className="text-gray-500 mb-4">Sube tu primera imagen de personaje</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image: any) => (
                <div key={image._id} className="bg-white p-4 rounded-lg border-4 border-black shadow-lg">
                  <img
                    src={image.data}
                    alt={image.name}
                    className="w-full h-48 object-cover rounded-lg border-2 border-black mb-4"
                  />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{image.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(image.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteItem(image._id)}
                      className="bg-red-500 text-white p-2 rounded-lg border-2 border-black hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && !loading && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Actividades</h2>
              <button
                onClick={addNew}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg border-2 border-black hover:bg-teal-600 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Nueva Actividad
              </button>
            </div>

            {activities.length === 0 && !isEditing && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-black">
                <Edit3 size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay actividades aún</h3>
                <p className="text-gray-500 mb-4">Crea tu primera actividad</p>
                <button
                  onClick={addNew}
                  className="bg-teal-500 text-white px-6 py-2 rounded-lg border-2 border-black hover:bg-teal-600 transition-colors"
                >
                  Crear Primera Actividad
                </button>
              </div>
            )}

            <div className="grid gap-6">
              {activities.map((activity: any) => (
                <div key={activity._id} className="bg-white p-6 rounded-lg border-4 border-black shadow-lg">
                  {isEditing === activity._id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editData.title || ''}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="w-full p-3 border-2 border-black rounded-lg font-bold text-xl"
                        placeholder="Título de la actividad"
                      />
                      <textarea
                        value={editData.description || ''}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        className="w-full p-3 border-2 border-black rounded-lg h-32"
                        placeholder="Descripción de la actividad"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Enlaces</label>
                          <textarea
                            value={editData.links?.join('\n') || ''}
                            onChange={(e) => setEditData({ 
                              ...editData, 
                              links: e.target.value.split('\n').filter(link => link.trim()) 
                            })}
                            className="w-full p-3 border-2 border-black rounded-lg h-24"
                            placeholder="Un enlace por línea"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Documentos</label>
                          <textarea
                            value={editData.documents?.join('\n') || ''}
                            onChange={(e) => setEditData({ 
                              ...editData, 
                              documents: e.target.value.split('\n').filter(doc => doc.trim()) 
                            })}
                            className="w-full p-3 border-2 border-black rounded-lg h-24"
                            placeholder="Un documento por línea"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg border-2 border-black hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                          <Save size={16} />
                          Guardar
                        </button>
                        <button
                          onClick={() => setIsEditing(null)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg border-2 border-black hover:bg-gray-600 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{activity.title}</h3>
                          {activity.links && activity.links.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-600 mb-1">Enlaces:</p>
                              {activity.links.map((link: string, index: number) => (
                                <a
                                  key={index}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-teal-600 hover:text-teal-800 text-sm block"
                                >
                                  <Link size={14} className="inline mr-1" />
                                  {link}
                                </a>
                              ))}
                            </div>
                          )}
                          {activity.documents && activity.documents.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-600 mb-1">Documentos:</p>
                              {activity.documents.map((doc: string, index: number) => (
                                <p key={index} className="text-gray-700 text-sm">
                                  <FileUp size={14} className="inline mr-1" />
                                  {doc}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(activity._id, activity)}
                            className="bg-blue-500 text-white p-2 rounded-lg border-2 border-black hover:bg-blue-600 transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => deleteItem(activity._id)}
                            className="bg-red-500 text-white p-2 rounded-lg border-2 border-black hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700">{activity.description}</p>
                    </div>
                  )}
                </div>
              ))}

              {/* New activity form */}
              {isEditing && !activities.find(a => a._id === isEditing) && (
                <div className="bg-white p-6 rounded-lg border-4 border-black shadow-lg">
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editData.title || ''}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="w-full p-3 border-2 border-black rounded-lg font-bold text-xl"
                      placeholder="Título de la actividad"
                    />
                    <textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="w-full p-3 border-2 border-black rounded-lg h-32"
                      placeholder="Descripción de la actividad"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enlaces</label>
                        <textarea
                          value={editData.links?.join('\n') || ''}
                          onChange={(e) => setEditData({ 
                            ...editData, 
                            links: e.target.value.split('\n').filter(link => link.trim()) 
                          })}
                          className="w-full p-3 border-2 border-black rounded-lg h-24"
                          placeholder="Un enlace por línea"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Documentos</label>
                        <textarea
                          value={editData.documents?.join('\n') || ''}
                          onChange={(e) => setEditData({ 
                            ...editData, 
                            documents: e.target.value.split('\n').filter(doc => doc.trim()) 
                          })}
                          className="w-full p-3 border-2 border-black rounded-lg h-24"
                          placeholder="Un documento por línea"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg border-2 border-black hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <Save size={16} />
                        Guardar
                      </button>
                      <button
                        onClick={() => setIsEditing(null)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg border-2 border-black hover:bg-gray-600 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};