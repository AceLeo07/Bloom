import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import ForestScene from '../components/ForestScene';
import HabitModal from '../components/HabitModal';
import { AudioManager } from '../components/AudioManager';
import { useHabitStore } from '../store/habitStore';
import { api, ApiError } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogOut, Calendar } from 'lucide-react';

export default function ForestPage() {
  const { showModal } = useHabitStore();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTree, setCurrentTree] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!api.isAuthenticated()) {
          navigate('/');
          return;
        }

        const response = await api.getCurrentUser();
        setUser(response.user);
      } catch (error) {
        console.error('Auth check failed:', error);
        api.clearToken();
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadCurrentTree();
    }
  }, [user]);

  const loadCurrentTree = async () => {
    try {
      const response = await api.getCurrentTree();
      const tree = response.tree;
      
      setCurrentTree(tree);
      
      // Check if it's day 8 - time for new tree
      const daysSincePlanted = Math.floor((Date.now() - new Date(tree.planted_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSincePlanted >= 7) {
        await completeTreeAndStartNew(tree);
      }
    } catch (error: any) {
      if (error instanceof ApiError && error.code === 'NO_CURRENT_TREE') {
        // Create first tree
        await createNewTree();
      } else {
        console.error('Tree data error:', error);
        toast.error('Failed to load tree data');
      }
    }
  };

  const createNewTree = async () => {
    try {
      const response = await api.createTree();
      setCurrentTree(response.tree);
      toast.success(`Tree #${response.tree.tree_number} planted! 🌱`);
    } catch (error: any) {
      console.error('Create tree error:', error);
      toast.error('Failed to create new tree');
    }
  };

  const completeTreeAndStartNew = async (tree: any) => {
    try {
      const response = await api.completeTree(tree.id);
      
      // Small delay to show animation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Set the new tree
      setCurrentTree(response.newTree);
      
      const growthLevel = tree.health >= 75 ? 'fully' : tree.health >= 50 ? 'partially' : 'barely';
      toast.success(`Tree #${tree.tree_number} ${growthLevel} grown! It found its place in the forest 🌳`, {
        duration: 5000
      });
    } catch (error: any) {
      console.error('Complete tree error:', error);
      toast.error('Failed to complete tree cycle');
    }
  };

  const calculateNextPosition = (treeCount: number) => {
    const radius = 8;
    const angle = (treeCount * 137.5) * (Math.PI / 180); // Golden angle for natural distribution
    return {
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius
    };
  };

  const handleLogout = async () => {
    api.clearToken();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-sky-400 to-emerald-300">
        <div className="text-white text-2xl font-serif">Loading your forest...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-sky-400">
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <ForestScene currentTree={currentTree} />
          {/* <SplineFairy currentTree={currentTree} /> */}
        </Suspense>
      </Canvas>
      
      {showModal && <HabitModal currentTree={currentTree} onUpdate={loadCurrentTree} />}
      
      {/* Audio Controls */}
      <AudioManager />
      
      {/* UI Overlay */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <h1 className="font-serif text-4xl md:text-6xl text-white text-center drop-shadow-2xl tracking-wide">
          Bloom
        </h1>
        <p className="text-green-800 text-center text-sm md:text-base mt-2 font-sans drop-shadow-lg">
          {currentTree && `Tree #${currentTree.tree_number} • Day ${Math.min(7, Math.floor((Date.now() - new Date(currentTree.planted_at).getTime()) / (1000 * 60 * 60 * 24)) + 1)}/7`}
        </p>
      </div>

      {/* User info and logout */}
      <div className="absolute top-8 right-8 z-10 pointer-events-auto">
        <div className="bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2 flex items-center gap-3">
          <Calendar className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-medium">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="ml-2 p-2 hover:bg-white/20 rounded-full transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

