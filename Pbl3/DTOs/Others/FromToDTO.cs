using Pbl3.DTOs.Flight;

namespace Pbl3.DTOs.Others
{
    public class FromToDTO
    {
        public LocationDTO departure { get; set; }
        public LocationDTO arrival { get; set; }
        public string codeFlight { get; set; }
        public float length { get; set; }

    }
}
 