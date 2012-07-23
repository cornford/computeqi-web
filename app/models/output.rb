class Output
  include Mongoid::Document
  
  field :name, type: String
  field :description, type: String
  field :uom, type: String
  field :type, type: String, default: "Numeric"
  
  belongs_to :simulator_specification
  
  has_one :run_value
  has_one :screening_value
  has_one :emulator
  has_one :validation_value
  has_one :analysis_value
  
  def to_hash
    d = { dataType: 'Numeric', encodingType: 'double' }
    if self.description
      d[:detail] = self.description
    end
    if self.uom
      d[:uom] = self.uom
    end
     
    { identifier: self.name,
      description: d }
  end
  
  def to_s
    self.name
  end
end
