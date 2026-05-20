import React, { useState, useMemo } from 'react'
import {
  Container,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Chip,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Thermostat as ThermostatIcon,
  Timer as TimerIcon,
  Science as ScienceIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  LocalOffer as LocalOfferIcon,
  InvertColors as InvertColorsIcon,
} from '@mui/icons-material'
import { fabrics } from './data/fabrics'
import { dyes } from './data/dyes'
import {
  getSuitableDyesForFabric,
  getSuitableFabricsForDye,
  checkCompatibility,
  getDyeingParameters,
  getDyeingProcess,
  getConflictInfo,
  getFabricById,
  getDyeById,
} from './utils/matchingLogic'

export default function App() {
  const [selectedFabric, setSelectedFabric] = useState('')
  const [selectedDye, setSelectedDye] = useState('')

  const fabric = useMemo(() => getFabricById(selectedFabric), [selectedFabric])
  const dye = useMemo(() => getDyeById(selectedDye), [selectedDye])
  
  const suitableDyes = useMemo(() => 
    selectedFabric ? getSuitableDyesForFabric(selectedFabric) : dyes,
    [selectedFabric]
  )
  
  const suitableFabrics = useMemo(() => 
    selectedDye ? getSuitableFabricsForDye(selectedDye) : fabrics,
    [selectedDye]
  )
  
  const compatibility = useMemo(() => 
    selectedFabric && selectedDye 
      ? checkCompatibility(selectedFabric, selectedDye)
      : null,
    [selectedFabric, selectedDye]
  )
  
  const dyeingParams = useMemo(() => 
    selectedFabric && selectedDye && compatibility?.compatible
      ? getDyeingParameters(selectedFabric, selectedDye)
      : null,
    [selectedFabric, selectedDye, compatibility]
  )
  
  const dyeingProcess = useMemo(() => 
    selectedFabric && selectedDye && compatibility?.compatible
      ? getDyeingProcess(selectedFabric, selectedDye)
      : [],
    [selectedFabric, selectedDye, compatibility]
  )
  
  const conflictInfo = useMemo(() => 
    selectedFabric && selectedDye
      ? getConflictInfo(selectedFabric, selectedDye)
      : null,
    [selectedFabric, selectedDye]
  )

  const handleFabricChange = (e) => {
    setSelectedFabric(e.target.value)
  }

  const handleDyeChange = (e) => {
    setSelectedDye(e.target.value)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          <InvertColorsIcon sx={{ fontSize: 40, mr: 2, verticalAlign: 'middle' }} />
          面料染色配伍检测工具
        </Typography>
        <Typography variant="body1" color="text.secondary">
          智能匹配天然染料与面料材质，提供专业染色工艺方案
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
          选择面料材质与天然染料
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="fabric-select-label">面料材质</InputLabel>
              <Select
                labelId="fabric-select-label"
                id="fabric-select"
                value={selectedFabric}
                label="面料材质"
                onChange={handleFabricChange}
              >
                <MenuItem value="">
                  <em>请选择面料材质</em>
                </MenuItem>
                {fabrics.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.name} - {f.type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {fabric && (
              <Card sx={{ mt: 3, backgroundColor: '#fafafa' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {fabric.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {fabric.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {fabric.characteristics.map((char, idx) => (
                      <Chip key={idx} label={char} size="small" color="primary" variant="outlined" />
                    ))}
                  </Box>
                  <Typography variant="body2">
                    <strong>pH值范围：</strong>{fabric.phRange}
                  </Typography>
                  <Typography variant="body2">
                    <strong>最高耐温：</strong>{fabric.maxTemperature}°C
                  </Typography>
                  {fabric.note && (
                    <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                      <InfoIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      {fabric.note}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="dye-select-label">天然染料种类</InputLabel>
              <Select
                labelId="dye-select-label"
                id="dye-select"
                value={selectedDye}
                label="天然染料种类"
                onChange={handleDyeChange}
              >
                <MenuItem value="">
                  <em>请选择天然染料</em>
                </MenuItem>
                {(selectedFabric ? suitableDyes : dyes).map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name} - {d.color}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {dye && (
              <Card sx={{ mt: 3, backgroundColor: '#fafafa' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    <LocalOfferIcon sx={{ mr: 1, fontSize: 18, verticalAlign: 'middle' }} />
                    {dye.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {dye.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip label={`来源: ${dye.source}`} size="small" />
                    <Chip label={`颜色: ${dye.color}`} size="small" color="secondary" />
                    <Chip label={`类型: ${dye.type}`} size="small" />
                  </Box>
                  <Typography variant="body2">
                    <strong>染色温度：</strong>{dye.temperature[0]}-{dye.temperature[1]}°C
                  </Typography>
                  <Typography variant="body2">
                    <strong>染色时间：</strong>{dye.duration[0]}-{dye.duration[1]}分钟
                  </Typography>
                  {dye.note && (
                    <Typography variant="body2" color="info.main" sx={{ mt: 1 }}>
                      <InfoIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      {dye.note}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Paper>

      {conflictInfo && conflictInfo.hasConflict && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          <ErrorIcon sx={{ mr: 1 }} />
          {conflictInfo.message}
        </Alert>
      )}

      {compatibility && (
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
            配伍检测结果
          </Typography>
          
          {compatibility.compatible ? (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              <CheckCircleIcon sx={{ mr: 1 }} />
              {compatibility.reason}
            </Alert>
          ) : (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              <WarningIcon sx={{ mr: 1 }} />
              {compatibility.reason}
            </Alert>
          )}

          {dyeingParams && (
            <>
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                染色工艺参数
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%', backgroundColor: '#fff8e1' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ThermostatIcon sx={{ color: '#f57c00', mr: 1 }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          适宜温度
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                        {dyeingParams.temperature.optimal}°C
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        范围: {dyeingParams.temperature.min}-{dyeingParams.temperature.max}°C
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%', backgroundColor: '#e3f2fd' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TimerIcon sx={{ color: '#1976d2', mr: 1 }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          染色时长
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                        {dyeingParams.duration.optimal}分钟
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        范围: {dyeingParams.duration.min}-{dyeingParams.duration.max}分钟
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%', backgroundColor: '#f3e5f5' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ScienceIcon sx={{ color: '#7b1fa2', mr: 1 }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          pH值范围
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ color: '#7b1fa2', fontWeight: 'bold' }}>
                        {dyeingParams.ph}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        染色最佳酸碱度
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%', backgroundColor: '#e8f5e9' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <InvertColorsIcon sx={{ color: '#388e3c', mr: 1 }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          固色方式
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ color: '#388e3c', fontWeight: 'bold' }}>
                        {dyeingParams.fixative}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        耐洗: {dyeingParams.washFastness} | 耐光: {dyeingParams.lightFastness}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {dyeingParams.suitableMordants.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                    可选用媒染剂
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {dyeingParams.suitableMordants.map((mordant) => (
                      <Chip
                        key={mordant.id}
                        label={`${mordant.name} - ${mordant.effect}`}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                染色实操流程方案
              </Typography>
              
              <Box>
                {dyeingProcess.map((step) => (
                  <Accordion key={step.step} defaultExpanded={step.step <= 2}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ backgroundColor: '#f5f5f0' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Chip 
                          label={`步骤 ${step.step}`} 
                          color="primary" 
                          size="small"
                          sx={{ mr: 2 }}
                        />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {step.name}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          <TimerIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          {step.time}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <InfoIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={step.description}
                            secondary={step.details}
                          />
                        </ListItem>
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </>
          )}
        </Paper>
      )}

      {!selectedFabric && !selectedDye && (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <InfoIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            请选择面料材质和天然染料
          </Typography>
          <Typography variant="body2" color="text.secondary">
            系统将自动检测配伍兼容性，提供专业的染色工艺参数和实操流程方案
          </Typography>
        </Paper>
      )}

      <Box sx={{ mt: 6, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="caption">
          面料染色配伍检测工具 - 基于天然染料传统工艺与现代染色技术
        </Typography>
      </Box>
    </Container>
  )
}
