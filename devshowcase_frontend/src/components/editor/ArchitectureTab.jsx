import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import ReactFlow, { Background, Controls, addEdge, useNodesState, useEdgesState, MarkerType } from 'reactflow'
import 'reactflow/dist/style.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import './EditorTabs.css'

// Custom node styling based on component type
const getNodeStyle = (technology) => {
  const tech = technology?.toLowerCase() || ''
  
  // Frontend components - Blue/Purple
  if (tech.includes('react') || tech.includes('vue') || tech.includes('angular') || tech.includes('frontend')) {
    return {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: '2px solid #5a67d8',
      boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)',
    }
  }
  
  // Backend/API - Green
  if (tech.includes('express') || tech.includes('django') || tech.includes('flask') || tech.includes('api') || tech.includes('server') || tech.includes('fastapi') || tech.includes('spring') || tech.includes('nest')) {
    return {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: '2px solid #059669',
      boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
    }
  }
  
  // Database - Orange/Red
  if (tech.includes('database') || tech.includes('postgres') || tech.includes('mysql') || tech.includes('mongo') || tech.includes('sqlite') || tech.includes('redis')) {
    return {
      background: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
      color: 'white',
      border: '2px solid #dc2626',
      boxShadow: '0 4px 6px rgba(245, 158, 11, 0.3)',
    }
  }
  
  // Cache - Yellow
  if (tech.includes('cache') || tech.includes('redis')) {
    return {
      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      color: 'white',
      border: '2px solid #f59e0b',
      boxShadow: '0 4px 6px rgba(251, 191, 36, 0.3)',
    }
  }
  
  // External Services - Cyan
  if (tech.includes('aws') || tech.includes('stripe') || tech.includes('sendgrid') || tech.includes('twilio') || tech.includes('firebase') || tech.includes('auth0') || tech.includes('external')) {
    return {
      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      color: 'white',
      border: '2px solid #0891b2',
      boxShadow: '0 4px 6px rgba(6, 182, 212, 0.3)',
    }
  }
  
  // Middleware - Pink
  if (tech.includes('middleware') || tech.includes('auth')) {
    return {
      background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      color: 'white',
      border: '2px solid #db2777',
      boxShadow: '0 4px 6px rgba(236, 72, 153, 0.3)',
    }
  }
  
  // Default - Gray
  return {
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    color: 'white',
    border: '2px solid #4b5563',
    boxShadow: '0 4px 6px rgba(107, 114, 128, 0.3)',
  }
}

const ArchitectureTab = ({ project, onUpdate }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    project.architecture_nodes.map(node => ({
      id: node.id.toString(),
      position: { x: node.x_position, y: node.y_position },
      data: { label: `${node.name}\n${node.technology}` },
      style: {
        ...getNodeStyle(node.technology),
        padding: '16px 20px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        minWidth: '180px',
        textAlign: 'center',
        whiteSpace: 'pre-line',
      },
    }))
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [formData, setFormData] = useState({ name: '', technology: '', description: '' })

  const onConnect = useCallback(params => setEdges(eds => addEdge({
    ...params,
    animated: true,
    style: { stroke: '#94a3b8', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
  }, eds)), [])

  const handleNodeDragStop = async (event, node) => {
    const nodeData = project.architecture_nodes.find(n => n.id.toString() === node.id)
    if (nodeData) {
      try {
        await axios.put(`/api/architecture/${nodeData.id}/`, { ...nodeData, x_position: node.position.x, y_position: node.position.y })
      } catch { console.error('Failed to update node position') }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/architecture/', { ...formData, project: project.id, x_position: 100, y_position: 100 })
      toast.success('Architecture node added')
      setFormData({ name: '', technology: '', description: '' })
      onUpdate()
    } catch { toast.error('Failed to add architecture node') }
  }

  return (
    <div>
      <h3 className="editor-section-title">🏗 Architecture Diagram</h3>

      <div style={{
        height: '420px',
        marginBottom: '2rem',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={handleNodeDragStop}
          fitView
        >
          <Background color="rgba(148, 163, 184, 0.2)" gap={20} size={1} />
          <Controls />
        </ReactFlow>
      </div>

      <div className="editor-form">
        <h4 className="editor-form-title">+ Add Architecture Node</h4>
        <form onSubmit={handleSubmit}>
          {[
            { key: 'name', label: 'Node Name', type: 'input' },
            { key: 'technology', label: 'Technology', type: 'input' },
            { key: 'description', label: 'Description', type: 'textarea' },
          ].map(({ key, label, type }) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              {type === 'textarea' ? (
                <textarea className="form-textarea" rows={3} value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} required />
              ) : (
                <input type="text" className="form-input" value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} required />
              )}
            </div>
          ))}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-primary">
            + Add Node
          </motion.button>
        </form>
      </div>
    </div>
  )
}

export default ArchitectureTab
