using System.ComponentModel.DataAnnotations;

namespace WasaCommunity.Resources
{
    public class PushNotificationSubscriberResource
    {
        public string Endpoint { get; set; }
        public PushNotificationKeysResource Keys { get; set; }
    }
}